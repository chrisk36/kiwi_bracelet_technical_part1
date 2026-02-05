import "../styles.css";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PatientsList from "../components/PatientsList.jsx";
import { fetchNurseProfile, fetchPatients, logout as logoutApi } from "../api";

export default function Home() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [prof, pats] = await Promise.all([
          fetchNurseProfile(),
          fetchPatients(),
        ]);
        if (cancelled) return;

        setProfile(prof);
        setPatients(Array.isArray(pats) ? pats : []);
      } catch (e) {
        if (cancelled) return;

        const status = e?.status ?? e?.response?.status;
        setError(e?.message || "Failed to load data.");

        if (status === 401) {
          try {
            await logoutApi();
          } finally {
            navigate("/login", { replace: true });
          }
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

  async function handleLogout() {
    await logoutApi();
    navigate("/login", { replace: true });
  }

  const nurseName =
    profile?.fullName ??
    profile?.name ??
    profile?.displayName ??
    (profile?.firstName || profile?.lastName
      ? `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()
      : "—");

  const facility =
    profile?.facility ??
    profile?.facilityName ??
    profile?.hospital ??
    profile?.organization ??
    "—";

  return (
    <div className="page">
      <div className="home-header">
        <div className="home-header-left">
          <div className="home-greeting">Hi {nurseName}</div>
          <div className="home-location">{facility}</div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link className="btn login" to="/profile">
            Profile
          </Link>
          <button className="btn signup" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <h2>Assigned Patients</h2>

      {error ? (
        <div className="card">
          <div style={{ fontWeight: 800, marginBottom: 6 }}>
            Something went wrong
          </div>
          <div style={{ color: "rgba(57,55,91,0.75)" }}>{error}</div>
        </div>
      ) : null}

      {loading ? (
        <div className="card muted">Loading patients…</div>
      ) : (
        <PatientsList patients={patients} />
      )}
    </div>
  );
}
