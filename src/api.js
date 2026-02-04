const BASE = "https://kiwivoiceassistant.com/api";

function getAccessToken() {
  return localStorage.getItem("accessToken") || "";
}

function getRefreshToken() {
  return localStorage.getItem("refreshToken") || "";
}

async function parseJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function makeError(res, data) {
  const msg =
    (data && (data.message || data.error)) ||
    (res.status === 400
      ? "Invalid request (missing fields)."
      : res.status === 401
      ? "Invalid credentials."
      : `Request failed (HTTP ${res.status}).`);
  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  return err;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);
  return data;
}

export async function fetchNurseProfile() {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/nurse/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);
  return data;
}

export async function fetchPatients() {
  const token = getAccessToken();
  const res = await fetch(`${BASE}/nurse/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);

  return Array.isArray(data) ? data : data?.patients ?? [];
}

export async function logout() {
  const refreshToken = getRefreshToken();

  if (refreshToken) {
    try {
      await fetch(`${BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore
    }
  }

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}
