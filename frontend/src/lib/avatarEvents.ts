export const AVATAR_UPDATED_EVENT = "hk:avatar-updated";

export function dispatchAvatarUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AVATAR_UPDATED_EVENT));
  }
}
