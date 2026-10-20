
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";

import { loginUser } from "../services/auth";
export default function Login() {
  const navigate = useNavigate();
const location = useLocation();
const successMessage = location.state?.message;
  // FORM STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await loginUser(email, password);

      // SAVE JWT TOKEN
      sessionStorage.setItem(
        "applyflow_token",
        result.access_token
      );

      // REDIRECT TO DASHBOARD
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.message || "Impossible de se connecter."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">

      {/* LEFT SIDE */}
      <div className="authLeft">

        <Link to="/" className="authLogo">
          <div className="authLogoIcon">
            <BriefcaseBusiness size={20} />
          </div>
          ApplyFlow
        </Link>

        <div className="authHero">
          <span className="authBadge">
            BON RETOUR
          </span>

          <h1>
            Continuez votre
            <span> recherche.</span>
          </h1>

          <p>
            Retrouvez vos candidatures, réponses et campagnes
            depuis votre tableau de bord.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="authRight">

        <div className="authForm">

          <div className="authHeading">
            <h2>Connexion</h2>

            <p>
              Pas encore de compte ?{" "}
              <Link to="/register">
                Créer un compte
              </Link>
            </p>
          </div>

          {successMessage && (
  <div
    role="status"
    style={{
      background: "#ecfdf5",
      color: "#047857",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "16px",
    }}
  >
    {successMessage}
  </div>
)}

          <form onSubmit={handleLogin}>

            {/* EMAIL */}
            <div className="field">
              <label htmlFor="login-email">
                Adresse email
              </label>

              <input
                id="login-email"
                type="email"
                placeholder="vous@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="field">

              <div className="labelBetween">
                <label htmlFor="login-password">
                  Mot de passe
                </label>

                <button
                  type="button"
                  className="textButton"
                  disabled
                  title="Fonctionnalité bientôt disponible"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <input
                id="login-password"
                type="password"
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div
                role="alert"
                style={{
                  color: "#dc2626",
                  background: "#fef2f2",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              className="authSubmit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Connexion en cours..."
                : "Se connecter"
              }

              {!loading && <ArrowRight size={18} />}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
