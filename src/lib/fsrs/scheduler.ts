import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade
} from "ts-fsrs";

/*
 * Thin, deterministic wrapper around ts-fsrs. The rest of the app speaks in
 * plain string ratings/states and ISO timestamps; ts-fsrs Card/Date objects
 * stay inside this module.
 *
 * This is FSRS review scheduling only. Skill mastery is a separate concern
 * (see docs/SKILL_ENGINE.md) and must not be derived from card state here.
 */

export type ReviewRating = "again" | "hard" | "good" | "easy";
export type ReviewCardState = "new" | "learning" | "review" | "relearning";

export type ReviewSchedule = {
  state: ReviewCardState;
  due_at: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  last_reviewed_at: string | null;
};

export type ReviewLogSnapshot = {
  rating: ReviewRating;
  state: ReviewCardState;
  due_at: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  last_elapsed_days: number;
  scheduled_days: number;
  reviewed_at: string;
};

const scheduler = fsrs(generatorParameters());

const STATE_TO_STRING: Record<State, ReviewCardState> = {
  [State.New]: "new",
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning"
};

const STRING_TO_STATE: Record<ReviewCardState, State> = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning
};

const RATING_TO_GRADE: Record<ReviewRating, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy
};

function cardToSchedule(card: Card): ReviewSchedule {
  return {
    state: STATE_TO_STRING[card.state],
    due_at: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    last_reviewed_at: card.last_review ? card.last_review.toISOString() : null
  };
}

function scheduleToCard(schedule: ReviewSchedule): Card {
  return {
    due: new Date(schedule.due_at),
    stability: schedule.stability,
    difficulty: schedule.difficulty,
    elapsed_days: schedule.elapsed_days,
    scheduled_days: schedule.scheduled_days,
    learning_steps: schedule.learning_steps,
    reps: schedule.reps,
    lapses: schedule.lapses,
    state: STRING_TO_STATE[schedule.state],
    last_review: schedule.last_reviewed_at ? new Date(schedule.last_reviewed_at) : undefined
  };
}

/** A fresh, due-now schedule for a brand-new review card. */
export function createInitialSchedule(now: Date = new Date()): ReviewSchedule {
  return cardToSchedule(createEmptyCard(now));
}

/**
 * Apply a learner's rating to a card schedule, returning the next schedule and
 * a log snapshot of the review.
 */
export function applyRating(
  schedule: ReviewSchedule,
  rating: ReviewRating,
  now: Date = new Date()
): { schedule: ReviewSchedule; log: ReviewLogSnapshot } {
  const { card, log } = scheduler.next(scheduleToCard(schedule), now, RATING_TO_GRADE[rating]);

  return {
    schedule: cardToSchedule(card),
    log: {
      rating,
      state: STATE_TO_STRING[log.state],
      due_at: log.due.toISOString(),
      stability: log.stability,
      difficulty: log.difficulty,
      elapsed_days: log.elapsed_days,
      last_elapsed_days: log.last_elapsed_days,
      scheduled_days: log.scheduled_days,
      reviewed_at: log.review.toISOString()
    }
  };
}

export const REVIEW_RATINGS: ReviewRating[] = ["again", "hard", "good", "easy"];
