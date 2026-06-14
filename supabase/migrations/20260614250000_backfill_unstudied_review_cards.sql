-- Roadmap #142 (evidence-driven review cards): clean up the review cards that the
-- old page-visit behavior auto-created. Visiting /review used to enroll a card
-- for every eligible item (including lessons), flooding learners with unstudied
-- content. Cards are now created only from real learning evidence.
--
-- Remove cards that carry no review history (never rated): those are the
-- auto-enrolled ones. Any card with actual review history (reps > 0 or a recorded
-- last_reviewed_at) is preserved. Also remove any card for a lesson item, which
-- is no longer review-eligible. This is a data cleanup, not a schema change.

delete from public.review_cards rc
where exists (
  select 1
    from public.learning_items li
    where li.id = rc.learning_item_id
      and li.type = 'lesson'
);

delete from public.review_cards
where reps = 0
  and lapses = 0
  and last_reviewed_at is null;
