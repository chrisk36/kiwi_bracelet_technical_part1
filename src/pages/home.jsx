import "../styles.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientList from "../components/PatientsList.jsx";
import { fetchNurseProfile, fetchPatients, logout as logoutApi } from "../api";

export default function Home() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setError("");
    setLoadingPatients(true);

    try {
      const [prof, pats] = await Promise.all([
        fetchNurseProfile(),
        fetchPatients(),
      ]);
      setProfile(prof);
      setPatients(pats);
    } catch (e) {
      setError(e.message || "Failed to load data.");
      if (e?.status === 401) {
        await logoutApi();
        navigate("/login", { replace: true });
      }
    } finally {
      setLoadingPatients(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await logoutApi();
    navigate("/login", { replace: true });
  }

  // Force name display as requested
  const nurseName = "Sarah Chen";

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

        <button className="home-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error ? (
        <div className="card error">
          <div className="error-title">Something went wrong</div>
          <div className="error-msg">{error}</div>
        </div>
      ) : null}

      <div className="section">
        <h2 className="section-title" style={{ color: "#000000" }}>
          Assigned Patients
        </h2>

        {loadingPatients ? (
          <div className="card muted">Loading patients…</div>
        ) : (
          <PatientList patients={patients} />
        )}
      </div>
    </div>
  );
}
