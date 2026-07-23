export function isCurrentUserLabVersionComplete(
  progress:
    | {
        project_id: string;
        status: string;
        content_version_id: string | null;
      }
    | null
    | undefined,
  itemId: string,
  contentVersionId: string
): boolean {
  return Boolean(
    progress &&
    progress.project_id === itemId &&
    progress.status === "completed" &&
    progress.content_version_id === contentVersionId
  );
}
