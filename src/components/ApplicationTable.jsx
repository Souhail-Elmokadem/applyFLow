
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MoreHorizontal } from "lucide-react";

import { getApplications } from "../services/api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(value) {
  const status = String(value || "").toLowerCase();

  if (["sent", "envoyé", "envoyée", "envoyee"].includes(status)) {
    return {
      label: "Envoyée",
      className: "statusSent",
    };
  }

  if (["reply", "replied", "réponse", "reponse"].includes(status)) {
    return {
      label: "Réponse",
      className: "statusReply",
    };
  }

  if (["failed", "error", "erreur", "échec", "echec"].includes(status)) {
    return {
      label: "Échec",
      className: "statusWaiting",
    };
  }

  return {
    label: value || "En attente",
    className: "statusWaiting",
  };
}

export default function ApplicationTable() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        const data = await getApplications();

        if (active) {
          setApplications(
            Array.isArray(data) ? data.slice(0, 5) : []
          );
        }
      } catch (err) {
        console.error("APPLICATION TABLE ERROR:", err);

        if (active) {
          setError(
            err.message || "Impossible de charger les candidatures."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="applicationsTable">
      <div className="tableHeader">
        <span>Entreprise</span>
        <span>Poste</span>
        <span>Date</span>
        <span>Statut</span>
        <span></span>
      </div>

      {loading && (
        <div className="tableRow">
          Chargement des candidatures...
        </div>
      )}

      {!loading && error && (
        <div className="tableRow" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="tableRow">
          Aucune candidature pour le moment.
        </div>
      )}

      {!loading && !error && applications.map((application, index) => {
        const status = formatStatus(application.status);

        return (
          <motion.div
            className="tableRow"
            key={application.id}
            initial={{
              opacity: 0,
              x: -12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.35,
              delay: index * 0.06,
            }}
          >
            <div className="tableCompany">
              <div className="tableCompanyLogo">
                {application.company_name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div>
                <strong>
                  {application.company_name || "Entreprise"}
                </strong>

                <span>
                  {application.company_address || "Adresse non renseignée"}
                </span>
              </div>
            </div>

            <span className="jobName">
              {application.activity || "—"}
            </span>

            <span className="tableDate">
              {formatDate(
                application.sent_at || application.created_at
              )}
            </span>

            <div>
              <span
                className={`applicationStatus ${status.className}`}
              >
                <i />
                {status.label}
              </span>
            </div>

            <button
              className="rowMenu"
              type="button"
              disabled
              title="Détails bientôt disponibles"
            >
              <MoreHorizontal size={19} />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
