"use client";

import { useEffect } from "react";

export function GoalDraftCleanup() {
  useEffect(() => window.localStorage.removeItem("cppfan:goal-wizard:v1"), []);
  return null;
}
