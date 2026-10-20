
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings as SettingsIcon,
  UserRound,
  Mail,
  Bell,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Link2,
  Unplug,
  Loader2,
  AlertCircle,
  LockKeyhole,
  RefreshCw,
  Sparkles,
  Inbox,
} from "lucide-react";

import {
  getEmailAccounts,
  connectGmail,
  disconnectEmailAccount,
} from "../services/api";

import { getCurrentUser } from "../services/auth";

import "../styles/Settings.css";

const tabs = [
  { id: "profile", label: "Mon profil", icon: UserRound },
  { id: "emails", label: "Comptes email", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: ShieldCheck },
];

function GmailLogo() {
  return (
    <div className="settings-provider-logo gmail-logo">
      <svg width="30" height="30" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M6 12v27h7V21z" />
        <path fill="#34A853" d="M35 21v18h7V12z" />
        <path
          fill="#EA4335"
          d="M6 12l18 14 18-14V6L24 20 6 6z"
        />
        <path fill="#C5221F" d="M6 6v6l7 9V11z" />
        <path fill="#FBBC04" d="M35 11v10l7-9V6z" />
      </svg>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="settings-section-heading">
      <div className="settings-section-icon">
        <Icon size={21} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState("emails");
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadAccounts() {
    const result = await getEmailAccounts();
    setAccounts(result.accounts || []);
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      const token = sessionStorage.getItem("applyflow_token");

      const results = await Promise.allSettled([
        token ? getCurrentUser(token) : Promise.resolve(null),
        getEmailAccounts(),
      ]);

      if (!active) return;

      if (results[0].status === "fulfilled") {
        setUser(results[0].value);
      }

      if (results[1].status === "fulfilled") {
        setAccounts(results[1].value.accounts || []);
      } else {
        setError("Impossible de charger les comptes email.");
      }

      setLoading(false);
    }

    initialize();

    return () => {
      active = false;
    };
  }, []);

  async function handleConnectGmail() {
    try {
      setConnecting(true);
      setError("");
      await connectGmail();
    } catch (err) {
      setError(err.message || "Connexion Gmail impossible.");
      setConnecting(false);
    }
  }

  async function handleDisconnect(id) {
    if (!window.confirm("Déconnecter ce compte email ?")) return;

    try {
      setDisconnectingId(id);
      setError("");
      setNotice("");

      await disconnectEmailAccount(id);
      await loadAccounts();

      setNotice("Compte email déconnecté.");
    } catch (err) {
      setError(err.message || "Déconnexion impossible.");
    } finally {
      setDisconnectingId(null);
    }
  }

  async function handleRefresh() {
    try {
      setLoading(true);
      setError("");
      await loadAccounts();
    } catch {
      setError("Actualisation impossible.");
    } finally {
      setLoading(false);
    }
  }

  const gmailAccounts = accounts.filter(
    (a) => a.provider === "gmail"
  );

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "Utilisateur ApplyFlow";

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
    : "AF";

  return (
    <div className="settings-page">
      <div className="settings-container">

        <div className="settings-header">
          <div>
            <div className="settings-breadcrumb">
              Workspace <ChevronRight size={13} /> Paramètres
            </div>

            <div className="settings-title-row">
              <div className="settings-header-icon">
                <SettingsIcon size={24} />
              </div>

              <div>
                <h1>Paramètres</h1>
                <p>
                  Gérez votre profil et vos intégrations ApplyFlow.
                </p>
              </div>
            </div>
          </div>

          <div className="settings-workspace-badge">
            <Sparkles size={15} />
            ApplyFlow Workspace
          </div>
        </div>

        <div className="settings-layout">

          <aside className="settings-sidebar">
            <div className="settings-sidebar-label">
              PRÉFÉRENCES
            </div>

            <nav className="settings-navigation">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`settings-nav-item ${
                      activeTab === tab.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError("");
                      setNotice("");
                    }}
                  >
                    <Icon size={19} />
                    <span>{tab.label}</span>
                    <ChevronRight size={15} className="nav-arrow" />
                  </button>
                );
              })}
            </nav>

            <div className="settings-help-card">
              <div className="settings-help-icon">
                <Sparkles size={19} />
              </div>
              <h4>Votre espace ApplyFlow</h4>
              <p>
                Personnalisez votre compte et gérez
                vos connexions email.
              </p>
            </div>
          </aside>

          <main className="settings-main">
            {error && (
              <div className="settings-alert error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {notice && (
              <div className="settings-alert success">
                <CheckCircle2 size={18} />
                {notice}
              </div>
            )}

            <AnimatePresence mode="wait">

              {activeTab === "emails" && (
                <motion.div
                  key="emails"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="settings-tab-content"
                >
                  <div className="settings-card">
                    <div className="settings-card-header">
                      <SectionTitle
                        icon={Link2}
                        title="Comptes email connectés"
                        description="Connectez vos adresses pour vos candidatures."
                      />

                      <button
                        type="button"
                        className="settings-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loading}
                      >
                        <RefreshCw
                          size={16}
                          className={loading ? "settings-spin" : ""}
                        />
                        Actualiser
                      </button>
                    </div>

                    <div className="settings-stats-grid">
                      <div className="settings-stat">
                        <span>Comptes connectés</span>
                        <strong>{accounts.length}</strong>
                      </div>

                      <div className="settings-stat green">
                        <span>Comptes Gmail</span>
                        <strong>{gmailAccounts.length}</strong>
                      </div>

                      <div className="settings-stat blue">
                        <span>Comptes Outlook</span>
                        <strong>
                          {accounts.filter(
                            (a) => a.provider === "outlook"
                          ).length}
                        </strong>
                      </div>
                    </div>

                    <div className="settings-provider">
                      <div className="settings-provider-top">
                        <div className="settings-provider-identity">
                          <GmailLogo />

                          <div>
                            <h3>Gmail</h3>
                            <p>Google & Google Workspace</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="settings-primary-btn"
                          onClick={handleConnectGmail}
                          disabled={connecting}
                        >
                          {connecting ? (
                            <Loader2
                              size={16}
                              className="settings-spin"
                            />
                          ) : (
                            <Link2 size={16} />
                          )}
                          {connecting
                            ? "Connexion..."
                            : "Connecter Gmail"}
                        </button>
                      </div>

                      {loading ? (
                        <div className="settings-loading">
                          <Loader2
                            size={17}
                            className="settings-spin"
                          />
                          Chargement...
                        </div>
                      ) : gmailAccounts.length === 0 ? (
                        <div className="settings-empty">
                          <Inbox size={25} />
                          <p>Aucun compte Gmail connecté</p>
                        </div>
                      ) : (
                        <div className="settings-accounts-list">
                          {gmailAccounts.map((account) => (
                            <div
                              key={account.id}
                              className="settings-connected-account"
                            >
                              <div className="settings-account-info">
                                <div className="settings-account-check">
                                  <CheckCircle2 size={20} />
                                </div>

                                <div>
                                  <strong>
                                    {account.email_address}
                                  </strong>
                                  <span>
                                    Connecté à ApplyFlow
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                className="settings-disconnect-btn"
                                onClick={() =>
                                  handleDisconnect(account.id)
                                }
                                disabled={
                                  disconnectingId === account.id
                                }
                              >
                                {disconnectingId === account.id ? (
                                  <Loader2
                                    size={15}
                                    className="settings-spin"
                                  />
                                ) : (
                                  <Unplug size={15} />
                                )}
                                Déconnecter
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="settings-provider">
                      <div className="settings-provider-top">
                        <div className="settings-provider-identity">
                          <div className="settings-provider-logo outlook-logo">
                            <Mail size={25} />
                          </div>

                          <div>
                            <h3>Outlook</h3>
                            <p>Microsoft 365 & Outlook.com</p>
                          </div>
                        </div>

                        <span className="settings-soon-badge">
                          Bientôt disponible
                        </span>
                      </div>

                      <button
                        type="button"
                        className="settings-outlook-btn"
                        disabled
                      >
                        <Link2 size={16} />
                        Connecter Outlook
                      </button>
                    </div>
                  </div>

                  <div className="settings-security-note">
                    <LockKeyhole size={21} />
                    <div>
                      <strong>Connexion sécurisée</strong>
                      <p>
                        ApplyFlow utilise OAuth 2.0.
                        Votre mot de passe Gmail n'est jamais
                        demandé par ApplyFlow.
                        Les jetons sont chiffrés côté serveur.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="settings-card"
                >
                  <SectionTitle
                    icon={UserRound}
                    title="Mon profil"
                    description="Informations personnelles de votre compte."
                  />

                  <div className="settings-profile-banner">
                    <div className="settings-avatar">
                      {initials}
                    </div>
                    <div>
                      <h3>{fullName}</h3>
                      <p>{user?.email || ""}</p>
                      <span className="settings-profile-active">
                        <CheckCircle2 size={13} />
                        Compte actif
                      </span>
                    </div>
                  </div>

                  <div className="settings-fields">
                    <div className="settings-field">
                      <label>Prénom</label>
                      <div>{user?.first_name || "Non renseigné"}</div>
                    </div>

                    <div className="settings-field">
                      <label>Nom</label>
                      <div>{user?.last_name || "Non renseigné"}</div>
                    </div>

                    <div className="settings-field full">
                      <label>Adresse email</label>
                      <div>{user?.email || "Non renseigné"}</div>
                    </div>
                  </div>

                  <p className="settings-readonly">
                    Informations actuellement en lecture seule.
                  </p>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="settings-card"
                >
                  <SectionTitle
                    icon={Bell}
                    title="Notifications"
                    description="Préférences de communication."
                  />

                  <div className="settings-placeholder">
                    <Bell size={30} />
                    <h3>Notifications à venir</h3>
                    <p>
                      Les préférences de notifications
                      seront disponibles prochainement.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="settings-card"
                >
                  <SectionTitle
                    icon={ShieldCheck}
                    title="Sécurité"
                    description="Protection de votre compte ApplyFlow."
                  />

                  <div className="settings-security-item">
                    <LockKeyhole size={21} />
                    <div>
                      <strong>Authentification sécurisée</strong>
                      <p>
                        Votre compte utilise une authentification JWT.
                      </p>
                    </div>
                  </div>

                  <div className="settings-security-item">
                    <ShieldCheck size={21} />
                    <div>
                      <strong>Connexion OAuth 2.0</strong>
                      <p>
                        Vos comptes Gmail sont associés à votre
                        utilisateur ApplyFlow.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <div className="settings-footer">
              <span>ApplyFlow · Paramètres du compte</span>
              <span>Votre espace personnel</span>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
