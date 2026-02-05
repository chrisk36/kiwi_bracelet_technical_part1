import "../styles.css";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchNurseProfile,
  updateNurseProfile,
  logout as logoutApi,
} from "../api";

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    facility: "",
    shiftPreference: "Day",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const p = await fetchNurseProfile();
        if (cancelled) return;

        setProfile(p);

        const fullName =
          p?.fullName ??
          p?.name ??
          (p?.firstName || p?.lastName
            ? `${p?.firstName || ""} ${p?.lastName || ""}`.trim()
            : "");

        const facility = p?.facility ?? p?.facilityName ?? p?.hospital ?? "";
        const shiftPreference = p?.shiftPreference ?? p?.shift ?? "Day";

        setForm({
          fullName: fullName || "",
          facility: facility || "",
          shiftPreference: shiftPreference === "Night" ? "Night" : "Day",
        });
      } catch (e) {
        if (cancelled) return;
        const status = e?.status ?? e?.response?.status;
        setError(e?.message || "Failed to load profile.");
        if (status === 401) {
          await logoutApi();
          navigate("/login", { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function setField(key, value) {
    setSuccess("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Only send editable fields
      const patch = {
        fullName: form.fullName,
        facility: form.facility,
        shiftPreference: form.shiftPreference,
      };

      const updated = await updateNurseProfile(patch, "PATCH");
      setProfile(updated);
      setSuccess("Saved.");
    } catch (e2) {
      setError(e2?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logoutApi();
    navigate("/login", { replace: true });
  }

  const email = profile?.email ?? profile?.username ?? "—";
  const nurseId = profile?.nurseId ?? profile?.id ?? profile?.nurse_id ?? "—";

  return (
    <div className="page">
      <div className="home-header">
        <div className="home-header-left">
          <div className="home-greeting">Profile</div>
          <div className="home-location">Manage your nurse information</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link className="btn login" to="/home">
            Home
          </Link>
          <button className="btn signup" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card muted">Loading profile…</div>
      ) : (
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div className="card" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <h2 style={{ marginTop: 0, color: "var(--teal)" }}>
              Nurse Profile
            </h2>

            {error ? <div className="auth-error">{error}</div> : null}
            {success ? (
              <div
                className="auth-error"
                style={{
                  borderColor: "rgba(2,128,144,0.55)",
                  background: "rgba(2,128,144,0.12)",
                }}
              >
                {success}
              </div>
            ) : null}

            <form className="auth-form" onSubmit={onSave}>
              <label className="auth-label">
                Full Name
                <input
                  className="auth-input"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  required
                />
              </label>

              <label className="auth-label">
                Email (read-only)
                <input className="auth-input" value={email} readOnly />
              </label>

              <label className="auth-label">
                Nurse ID (read-only)
                <input className="auth-input" value={nurseId} readOnly />
              </label>

              <label className="auth-label">
                Facility
                <input
                  className="auth-input"
                  value={form.facility}
                  onChange={(e) => setField("facility", e.target.value)}
                />
              </label>

              <label className="auth-label">
                Shift Preference
                <select
                  className="auth-input"
                  value={form.shiftPreference}
                  onChange={(e) => setField("shiftPreference", e.target.value)}
                >
                  <option value="Day">Day</option>
                  <option value="Night">Night</option>
                </select>
              </label>

              <button
                className="btn login auth-primary"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
