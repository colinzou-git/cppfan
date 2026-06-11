import { create } from "zustand";

type DashboardMode = "today" | "skills" | "reviews";

type DashboardState = {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  mode: "today",
  setMode: (mode) => set({ mode })
}));
