import { BrowserRouter, Routes, Route } from "react-router-dom";
import Base from "./pages/base";
import Login from "./pages/login";
import Home from "./pages/home";
import Profile from "./pages/profile.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Base />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
