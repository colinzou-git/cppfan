import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardHeader } from "@/features/dashboard/dashboard-header";

describe("DashboardHeader (#487)", () => {
  it("offers a prominent Create a lesson entry that opens the editor directly", () => {
    render(<DashboardHeader />);
    const create = screen.getByRole("link", { name: /create a lesson/i });
    expect(create.getAttribute("href")).toBe("/my-content/lessons/new");
  });

  it("keeps the My Content browse link", () => {
    render(<DashboardHeader />);
    expect(screen.getByRole("link", { name: /my content/i }).getAttribute("href")).toBe("/my-content");
  });
});
