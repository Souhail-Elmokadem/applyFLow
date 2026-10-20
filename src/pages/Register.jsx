
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";

import { registerUser } from "../services/auth";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (form.password.length < 12) {
      setError("Le mot de passe doit contenir au moins 12 caractères.");
      return;
    }

    if (!accepted) {
      setError("Veuillez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Compte créé avec succès. Connectez-vous.",
        },
      });
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      setError(
        err.message || "Impossible de créer votre compte."
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
          <span className="authBadge">APPLYFLOW</span>

          <h1>
            Votre recherche d'emploi,
            <span> simplifiée.</span>
          </h1>

          <p>
            Centralisez votre CV, vos critères et vos candidatures
            depuis un seul espace.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="authRight">
        <div className="authForm">
          <div className="authHeading">
            <h2>Créer votre compte</h2>

            <p>
              Déjà inscrit ?{" "}
              <Link to="/login">Se connecter</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div className="formRow">
              <div className="field">
                <label htmlFor="register-first-name">
                  Prénom
                </label>

                <input
                  id="register-first-name"
                  type="text"
                  name="first_name"
                  placeholder="Votre prénom"
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={updateField}
                  maxLength={100}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="register-last-name">
                  Nom
                </label>

                <input
                  id="register-last-name"
                  type="text"
                  name="last_name"
                  placeholder="Votre nom"
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={updateField}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="field">
              <label htmlFor="register-email">
                Adresse email
              </label>

              <input
                id="register-email"
                type="email"
                name="email"
                placeholder="vous@email.com"
                autoComplete="email"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="field">
              <label htmlFor="register-password">
                Mot de passe
              </label>

              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="12 caractères minimum"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                value={form.password}
                onChange={updateField}
                required
              />
            </div>

            {/* TERMS */}
            <label className="checkboxLine">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) =>
                  setAccepted(e.target.checked)
                }
                required
              />

              <span>
                J'accepte les conditions d'utilisation et la
                politique de confidentialité.
              </span>
            </label>

            {/* ERROR */}
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

            {/* SUBMIT */}
            <button
              className="authSubmit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Création du compte..."
                : "Créer mon compte"}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
