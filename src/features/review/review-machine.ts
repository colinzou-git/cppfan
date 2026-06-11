import { assign, setup } from "xstate";

export const reviewMachine = setup({
  types: {
    context: {} as {
      currentCardId: string | null;
    },
    events: {} as
      | { type: "START"; cardId: string }
      | { type: "ANSWER" }
      | { type: "RATE" }
      | { type: "COMPLETE" }
  }
}).createMachine({
  id: "review",
  initial: "idle",
  context: {
    currentCardId: null
  },
  states: {
    idle: {
      on: {
        START: {
          target: "showingCard",
          actions: assign({
            currentCardId: ({ event }) => event.cardId
          })
        }
      }
    },
    showingCard: {
      on: {
        ANSWER: "showingAnswer"
      }
    },
    showingAnswer: {
      on: {
        RATE: "savingReview"
      }
    },
    savingReview: {
      on: {
        COMPLETE: {
          target: "idle",
          actions: assign({
            currentCardId: () => null
          })
        }
      }
    }
  }
});
