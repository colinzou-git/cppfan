import { expect, test } from "@playwright/test";

const context = {
  schemaVersion: 1,
  sourceKind: "learning_item",
  sourceId: "lesson.tutor-scroll-regression",
  sourceVersion: "1",
  title: "Tutor scroll regression",
  prompt: "Explain the topic.",
  assessmentState: "instructional",
  revealPolicy: "normal"
} as const;

function longAnswer(turn: number) {
  const body = Array.from(
    { length: 90 },
    (_, index) => `Turn ${turn}, explanation line ${String(index + 1).padStart(2, "0")}: enough text to force the Tutor message pane to overflow.`
  ).join("\n");
  return `${body}\nTURN_${turn}_FINAL_LINE`;
}

test("multi-turn Tutor keeps the newest answer visible and the composer on screen", async ({ page }) => {
  let turn = 0;

  await page.route("**/api/ai/chat**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ conversations: [] })
      });
      return;
    }

    turn += 1;
    const response = [
      {
        type: "meta",
        conversationId: "tutor-scroll-regression",
        requestId: `request-${turn}`,
        provider: "mock",
        model: "mock"
      },
      { type: "delta", text: longAnswer(turn) },
      { type: "done", status: "complete" }
    ]
      .map((event) => JSON.stringify(event))
      .join("\n");

    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/x-ndjson" },
      body: response
    });
  });

  const url = `/tutor?mode=conversation&fresh=1&context=${encodeURIComponent(JSON.stringify(context))}`;
  await page.goto(url);

  const list = page.getByTestId("tutor-message-list");
  const composer = page.getByTestId("tutor-composer");
  const prompt = page.getByLabel("AI Chat prompt");

  await prompt.fill("First question");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("TURN_1_FINAL_LINE")).toBeVisible();

  await prompt.fill("Second question");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("TURN_2_FINAL_LINE")).toBeVisible();

  const scrollState = await list.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
    distanceFromBottom: element.scrollHeight - element.scrollTop - element.clientHeight
  }));

  expect(scrollState.scrollHeight).toBeGreaterThan(scrollState.clientHeight);
  expect(scrollState.distanceFromBottom).toBeLessThanOrEqual(2);

  const composerBox = await composer.boundingBox();
  const viewport = page.viewportSize();
  expect(composerBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(composerBox!.y + composerBox!.height).toBeLessThanOrEqual(viewport!.height + 1);

  // Deliberately move away from the bottom. A user's scroll gesture should disable
  // forced following until the next send rather than immediately snapping back.
  await list.evaluate((element) => {
    element.scrollTop = 0;
    element.dispatchEvent(new Event("scroll"));
  });
  await expect.poll(() => list.evaluate((element) => element.scrollTop)).toBe(0);

  await prompt.fill("Third question after rereading an older answer");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("TURN_3_FINAL_LINE")).toBeVisible();

  await expect
    .poll(() =>
      list.evaluate(
        (element) => element.scrollHeight - element.scrollTop - element.clientHeight
      )
    )
    .toBeLessThanOrEqual(2);
});
