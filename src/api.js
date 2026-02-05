const BASE = "https://kiwivoiceassistant.com/api";

/* -------------------- tokens -------------------- */
function getAccessToken() {
  return localStorage.getItem("accessToken") || "";
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken") || "";
}
function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

/* -------------------- helpers -------------------- */
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
      ? "Unauthorized."
      : `Request failed (HTTP ${res.status}).`);
  const err = new Error(msg);
  err.status = res.status;
  err.data = data;
  return err;
}

/* -------------------- auth -------------------- */
export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);

  // Accept various response shapes
  const accessToken = data?.accessToken || data?.access_token;
  const refreshToken = data?.refreshToken || data?.refresh_token;
  const user = data?.user || data?.nurse || data?.profile;

  if (accessToken) localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  if (user) localStorage.setItem("user", JSON.stringify(user));

  return data;
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    const err = new Error("Missing refresh token.");
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);

  setTokens({
    accessToken: data?.accessToken || data?.access_token,
    refreshToken: data?.refreshToken || data?.refresh_token || refreshToken,
  });

  return data;
}

async function authedFetch(url, options = {}, retry = true) {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  // refresh once on 401 then retry the original request
  if (res.status === 401 && retry) {
    await refreshAccessToken();
    return authedFetch(url, options, false);
  }

  return res;
}

/* -------------------- nurse -------------------- */
export async function fetchNurseProfile() {
  const res = await authedFetch(`${BASE}/nurse/profile`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);
  return data;
}

export async function updateNurseProfile(patch, method = "PATCH") {
  const res = await authedFetch(`${BASE}/nurse/profile`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);
  return data;
}

/* -------------------- patients -------------------- */
function normalizeLastSeen(patient) {
  const last = patient?.lastVitals || patient?.last_vitals || {};

  const hr = last?.hr ?? null;
  const spo2 = last?.spo2 ?? last?.spO2 ?? last?.SpO2 ?? null;

  // API uses tempC
  const temp =
    last?.temp ??
    last?.temperature ??
    last?.tempC ??
    last?.temperature_c ??
    null;

  // API uses lastSeen at top-level (epoch seconds)
  const timestamp = patient?.lastSeen ?? patient?.last_seen ?? null;

  return { hr, spo2, temp, timestamp };
}

export async function fetchPatients() {
  const res = await authedFetch(`${BASE}/nurse/patients`);
  const data = await parseJsonSafe(res);
  if (!res.ok) throw makeError(res, data);

  const raw =
    (Array.isArray(data) && data) ||
    data?.patients ||
    data?.data ||
    data?.results ||
    [];

  console.log(
    "ALL lastSeen values:",
    raw.map((p) => p?.lastSeen)
  );

  return raw.map((p) => ({
    ...p,
    id: p?.id ?? p?._id ?? p?.patientId ?? p?.patient_id,
    name: p?.name ?? p?.fullName ?? p?.patientName ?? "—",
    room: p?.room ?? p?.roomNumber ?? p?.bed ?? "—",
    lastSeen: normalizeLastSeen(p),
  }));
}

/* -------------------- logout -------------------- */
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
