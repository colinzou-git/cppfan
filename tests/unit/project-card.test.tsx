import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectCard } from "@/features/labs/project-card";

const markProjectComplete = vi.fn();

vi.mock("@/features/labs/project-actions", () => ({
  markProjectComplete: (...args: unknown[]) => markProjectComplete(...args)
}));

const project = {
  id: "csv-table-summarizer",
  title: "CSV table summarizer",
  summary: "Parse a CSV and summarize numeric columns.",
  difficulty: "intermediate" as const,
  focus: ["strings", "parsing"],
  milestones: ["Split lines on commas.", "Summarize numeric columns."]
};

describe("ProjectCard (#439)", () => {
  beforeEach(() => {
    markProjectComplete.mockReset();
  });

  it("renders exactly the four project-level actions", () => {
    render(<ProjectCard project={project} />);

    expect(screen.getByRole("link", { name: /^code$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ai chat/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chat history/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark complete/i })).toBeInTheDocument();
  });

  it("does not render milestone-level or removed UI", () => {
    render(<ProjectCard project={project} />);

    expect(screen.queryByText(/mark started/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/in-app code lab/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId("capstone-milestone-code")).not.toBeInTheDocument();
    expect(screen.queryByTestId("capstone-reflection")).not.toBeInTheDocument();
  });

  it("links Code to the project codebase, not a milestone id", () => {
    render(<ProjectCard project={project} />);
    const code = screen.getByTestId("project-code").querySelector("a") ?? screen.getByRole("link", { name: /^code$/i });
    const href = code.getAttribute("href") ?? "";
    expect(href).toContain("/lab/csv-table-summarizer");
    expect(href).not.toMatch(/\.m\d+/);
  });

  it("scopes AI Chat to the whole project (project_lab source)", () => {
    render(<ProjectCard project={project} />);
    const aiChat = screen.getByRole("link", { name: /ai chat/i });
    const href = decodeURIComponent(aiChat.getAttribute("href") ?? "");
    expect(href).toContain('"sourceKind":"project_lab"');
    expect(href).toContain('"sourceId":"csv-table-summarizer"');
    expect(href).not.toContain("capstone_milestone");
  });

  it("prompts to sign in when Mark complete is used signed out", async () => {
    markProjectComplete.mockResolvedValue({ status: "signed_out" });
    render(<ProjectCard project={project} />);

    fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() =>
      expect(screen.getByTestId("project-notice")).toHaveTextContent(/sign in to save project progress/i)
    );
  });

  it("shows a completed badge after a successful Mark complete", async () => {
    markProjectComplete.mockResolvedValue({ status: "ok" });
    render(<ProjectCard project={project} />);

    fireEvent.click(screen.getByRole("button", { name: /mark complete/i }));

    await waitFor(() => expect(screen.getByTestId("project-completed-badge")).toBeInTheDocument());
  });
});
