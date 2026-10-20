
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Supprimer le token JWT
    sessionStorage.removeItem("applyflow_token");

    // Rediriger vers Login
    navigate("/login", { replace: true });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="logoutButton"
    >
      <LogOut size={18} />
      <span>Déconnexion</span>
    </button>
  );
}
