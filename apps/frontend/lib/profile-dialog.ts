const PROFILE_DIALOG_TABS = [
  "profile",
  "security",
  "sessions",
  "links",
] as const;

export type ProfileDialogTab = (typeof PROFILE_DIALOG_TABS)[number];

export function parseProfileDialogTab(
  value: string | string[] | undefined | null,
): ProfileDialogTab | null {
  if (Array.isArray(value) || value == null) {
    return null;
  }

  return PROFILE_DIALOG_TABS.includes(value as ProfileDialogTab)
    ? (value as ProfileDialogTab)
    : null;
}
