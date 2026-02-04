import "../styles.css";
import { Link } from "react-router-dom";

export default function Base() {
  return (
    <div className="base">
      <h1>Nurse Helper</h1>
      <h2>Track patients with ease</h2>

      <div className="button-group">
        <Link className="btn login" to="/login">
          Log In
        </Link>
        <Link className="btn signup">Sign Up</Link>
      </div>
    </div>
  );
}
