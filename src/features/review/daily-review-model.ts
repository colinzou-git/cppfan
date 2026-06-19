export type DailyReviewItem = {
  cardId: string;
  itemId: string;
  skillId: string;
  title: string;
  href: string;
  dueAt: string;
  overdue: boolean;
};

export type DailyReviewView = {
  state: "ready" | "signed_out" | "unconfigured" | "unavailable" | "error";
  authenticated: boolean;
  timezone: string;
  items: DailyReviewItem[];
};
