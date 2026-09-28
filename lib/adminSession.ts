// One admin sign-in shared by /admin and /admin/memories for the life of the browser tab.
// sessionStorage clears when the tab closes; access is wrapped because it can throw
// (private browsing, blocked site data).
const KEY = "seminar-admin-password";

export function getAdminPassword(): string {
  try {
    return sessionStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminPassword(password: string) {
  try {
    if (password) sessionStorage.setItem(KEY, password);
    else sessionStorage.removeItem(KEY);
  } catch {
    // Not persisted; the admin will be asked to sign in again on the other page.
  }
}
