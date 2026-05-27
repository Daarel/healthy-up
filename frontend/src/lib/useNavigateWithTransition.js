import { useNavigate } from "react-router-dom";

/**
 * Navigate ke halaman lain dengan animasi fade-out singkat.
 * Cara pakai:
 *   const go = useNavigateWithTransition();
 *   go("/login");
 */
export function useNavigateWithTransition() {
  const navigate = useNavigate();

  return (to) => {
    const root = document.getElementById("root");
    if (!root) { navigate(to); return; }

    root.classList.add("page-exit");

    setTimeout(() => {
      root.classList.remove("page-exit");
      navigate(to);
    }, 200); // sesuai durasi page-exit di CSS
  };
}
