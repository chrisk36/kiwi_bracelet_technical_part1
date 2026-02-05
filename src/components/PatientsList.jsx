import "../styles.css";
import { useMemo, useState } from "react";

// Assumption: API returns epoch seconds
function toDateFromEpochSeconds(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return null;
  return new Date(n * 1000);
}

function formatRelativeFromEpochSeconds(ts) {
  const d = toDateFromEpochSeconds(ts);
  if (!d) return "—";

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "Just now";

  const sec = Math.floor(diffMs / 1000);
  if (sec < 30) return "Just now";
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

function numOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

function formatHr(v) {
  const n = numOrNull(v);
  return n === null ? "—" : `${Math.round(n)} bpm`;
}

function formatSpo2(v) {
  const n = numOrNull(v);
  return n === null ? "—" : `${Math.round(n)}%`;
}

function cToF(c) {
  return (c * 9) / 5 + 32;
}

function formatTemp(tempC, unit) {
  const n = numOrNull(tempC);
  if (n === null) return "—";
  if (unit === "F") return `${cToF(n).toFixed(1)}°F`;
  return `${n.toFixed(1)}°C`;
}

export default function PatientsList({ patients }) {
  const [tempUnit, setTempUnit] = useState("C");

  const hasAnyPatients = Array.isArray(patients) && patients.length > 0;

  const rows = useMemo(
    () => (hasAnyPatients ? patients : []),
    [patients, hasAnyPatients]
  );

  if (!hasAnyPatients) {
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
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            alignItems: "center",
          }}
        >
          Temp
          <button
            type="button"
            className="btn signup"
            onClick={() => setTempUnit((u) => (u === "C" ? "F" : "C"))}
            style={{
              padding: "6px 10px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1,
            }}
            title="Toggle temperature units"
          >
            °{tempUnit}
          </button>
        </span>
      </div>

      {rows.map((p, idx) => {
        const key = p?.id ?? `${p?.name}-${p?.room}-${idx}`;
        const last = p?.lastSeen || {};

        const exact = toDateFromEpochSeconds(last?.timestamp);
        const relative = formatRelativeFromEpochSeconds(last?.timestamp);

        return (
          <div className="patient-row" key={key}>
            <span className="name">{p?.name ?? "—"}</span>
            <span>{p?.room ?? "—"}</span>
            <span title={exact ? exact.toLocaleString() : ""}>{relative}</span>
            <span>{formatHr(last?.hr)}</span>
            <span>{formatSpo2(last?.spo2)}</span>
            <span>{formatTemp(last?.temp, tempUnit)}</span>
          </div>
        );
      })}
    </div>
  );
}
