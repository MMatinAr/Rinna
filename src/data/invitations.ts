export type InvitationTargetType = "business-owner" | "distributor";
export type InvitationDraft = {
  id: string;
  token: string;
  targetType: InvitationTargetType;
  targetId: string;
  targetName: string;
  createdAt: string;
  expiresAt: string;
  usedAt: null;
  status: "pending-backend" | "revoked" | "used";
  mode: "frontend-preview";
};

const INVITATIONS_KEY = "rinna-invitation-drafts-v1";

/**
 * Frontend preview only.
 * Production contract: POST /api/v1/invitations with targetType, targetId,
 * role and maxUses=1. The server must mint, hash, expire and atomically consume
 * the token. Never trust this browser-generated token for authentication.
 */
export function createInvitationPreview(targetType: InvitationTargetType, targetId: string, targetName: string) {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error("مرورگر امکان تولید شناسه امن را فراهم نکرد.");
  }
  const bytes = new Uint8Array(24);
  globalThis.crypto.getRandomValues(bytes);
  const token = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  const now = new Date();
  const record: InvitationDraft = {
    id: "INV-" + now.getTime() + "-" + token.slice(0, 8),
    token,
    targetType,
    targetId,
    targetName,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    usedAt: null,
    status: "pending-backend",
    mode: "frontend-preview"
  };
  let records: InvitationDraft[] = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(INVITATIONS_KEY) || "[]");
    if (Array.isArray(parsed)) records = parsed;
  } catch { /* start with an empty local preview list */ }
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify([record, ...records].slice(0, 100)));
  return { record, url: window.location.origin + "/invite/" + token };
}

export function readInvitationPreviews(): InvitationDraft[] {
  try {
    const value = JSON.parse(localStorage.getItem(INVITATIONS_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

/** Local preview only. Production must call DELETE /api/v1/invitations/:id. */
export function revokeInvitationPreview(id: string): InvitationDraft | null {
  const records = readInvitationPreviews();
  const target = records.find(item => item.id === id);
  if (!target || target.status !== "pending-backend") return null;
  const updated = records.map(item => item.id === id ? { ...item, status: "revoked" as const, revokedAt: new Date().toISOString() } : item);
  localStorage.setItem(INVITATIONS_KEY, JSON.stringify(updated));
  return updated.find(item => item.id === id) || null;
}
