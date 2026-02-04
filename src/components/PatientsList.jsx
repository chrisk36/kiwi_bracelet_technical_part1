import "../styles.css";

function safe(v, fallback = "—") {
  return v === null || v === undefined || v === "" ? fallback : v;
}

// Human readable "last seen"
export function formatLastSeen(lastSeen) {
  if (!lastSeen) return "—";

  const d = new Date(lastSeen);
  if (Number.isNaN(d.getTime())) return String(lastSeen);

  const diffMs = Date.now() - d.getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);

  const sec = Math.floor(abs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  const label =
    sec < 45
      ? "just now"
      : min < 60
      ? `${min} min`
      : hr < 24
      ? `${hr} hr`
      : `${day} day${day === 1 ? "" : "s"}`;

  return future ? `in ${label}` : label === "just now" ? label : `${label} ago`;
}

export default function PatientList({ patients }) {
  if (!patients || patients.length === 0) {
    return <div className="card muted">No assigned patients.</div>;
  }

  return (
    <div className="patient-table">
      <div className="patient-row header">
        <span>Patient</span>
        <span>Room</span>
        <span>Last seen</span>
        <span>HR</span>
        <span>SpO₂</span>
        <span>Temp</span>
      </div>

      {patients.map((p, idx) => (
        <div className="patient-row" key={idx}>
          <span className="name">{p.name ?? "—"}</span>
          <span>{p.room ?? "—"}</span>
          <span>{p.lastSeenHuman ?? "—"}</span>
          <span>{p.hr ?? "—"}</span>
          <span>{p.spo2 ?? "—"}</span>
          <span>{p.temp ?? "—"}</span>
        </div>
      ))}
    </div>
  );
}
