import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AuthLayout() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      {/* No Footer in Auth Layout */}
    </div>
  );
} 