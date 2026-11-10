declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
          revoke: (token: string, callback?: () => void) => void;
        };
      };
    };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCRIPT_URL = "https://accounts.google.com/gsi/client";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const DRIVE_FILE_NAME = "solo-leveling-data.json";

let scriptPromise: Promise<void> | undefined;

function loadGoogleIdentityServices() {
  if (window.google?.accounts.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_URL}"]`,
    );
    const script = existing ?? document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          "Google sign-in could not load. Check your connection and try again.",
        ),
      );
    if (!existing) document.head.appendChild(script);
  }).catch((error) => {
    scriptPromise = undefined;
    throw error;
  });
  return scriptPromise;
}

export async function requestGoogleDriveToken() {
  if (!CLIENT_ID)
    throw new Error(
      "Google sync needs VITE_GOOGLE_CLIENT_ID. Follow GOOGLE_SYNC_SETUP.md, add the Netlify environment variable, and redeploy.",
    );
  await loadGoogleIdentityServices();
  if (!window.google?.accounts.oauth2)
    throw new Error("Google sign-in is unavailable in this browser.");
  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) =>
        response.access_token
          ? resolve(response.access_token)
          : reject(
              new Error(
                response.error_description ??
                  response.error ??
                  "Google authorization was not granted.",
              ),
            ),
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}

async function driveRequest(url: string, token: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Google Drive returned ${response.status}: ${detail.slice(0, 220)}`,
    );
  }
  return response;
}

async function findBackup(token: string): Promise<string | undefined> {
  const query = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name='${DRIVE_FILE_NAME}' and trashed=false`,
    fields: "files(id,name,modifiedTime)",
    pageSize: "10",
  });
  const response = await driveRequest(
    `https://www.googleapis.com/drive/v3/files?${query}`,
    token,
  );
  const body = (await response.json()) as { files?: { id: string }[] };
  return body.files?.[0]?.id;
}

export async function uploadGoogleDriveBackup(backup: unknown, token: string) {
  const content = JSON.stringify(backup, null, 2);
  const existing = await findBackup(token);
  if (existing) {
    await driveRequest(
      `https://www.googleapis.com/upload/drive/v3/files/${existing}?uploadType=media`,
      token,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: content,
      },
    );
    return;
  }
  const boundary = `solo_leveling_${crypto.randomUUID()}`;
  const metadata = JSON.stringify({
    name: DRIVE_FILE_NAME,
    mimeType: "application/json",
    parents: ["appDataFolder"],
  });
  const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
  await driveRequest(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
    token,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: multipart,
    },
  );
}

export async function downloadGoogleDriveBackup(
  token: string,
): Promise<unknown> {
  const id = await findBackup(token);
  if (!id)
    throw new Error(
      "No Solo Leveling backup was found in this Google account yet.",
    );
  const response = await driveRequest(
    `https://www.googleapis.com/drive/v3/files/${id}?alt=media`,
    token,
  );
  return response.json();
}

export function revokeGoogleDriveToken(token: string) {
  window.google?.accounts.oauth2.revoke(token);
}

export function googleSyncIsConfigured() {
  return Boolean(CLIENT_ID);
}
