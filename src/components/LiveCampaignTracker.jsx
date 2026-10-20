import {
  useEffect,
  useMemo,
  useState,
} from "react";
import "../styles/liveCampaignTracker.css";
import { motion, AnimatePresence } from "framer-motion";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  LoaderCircle,
  Mail,
  Search,
  Send,
  TriangleAlert,
  Wifi,
  Zap,
  Pause,
  Play,
} from "lucide-react";

import {
  getCampaignProgress,
  getEmailAccounts,
  pauseCampaign,
  resumeCampaign,
} from "../services/api";


const ITEMS_PER_PAGE = 10;


// ========================================================
// COMPONENT
// ========================================================

export default function LiveCampaignTracker({
  campaignId,
}) {

  // ======================================================
  // STATES
  // ======================================================

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdate, setLastUpdate] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [currentPage, setCurrentPage] =
    useState(1);


const [gmailAccounts, setGmailAccounts] = useState([]);
const [selectedGmailId, setSelectedGmailId] = useState("");
const [actionLoading, setActionLoading] = useState(false);
const [actionError, setActionError] = useState("");
const [actionMessage, setActionMessage] = useState("");
const campaignStatus = data?.status || "";
const pendingCount = data?.pending ?? 0;

useEffect(() => {
  let cancelled = false;

  async function loadGmailAccounts() {
    try {
      const result = await getEmailAccounts();

      if (cancelled) return;

     const accountList = Array.isArray(result)
  ? result
  : Array.isArray(result.accounts)
  ? result.accounts
  : [];

const accounts = accountList.filter(
  (account) =>
    account.provider === "gmail" &&
    account.is_active === true
);

      setGmailAccounts(accounts);

      if (accounts.length > 0) {
        setSelectedGmailId(String(accounts[0].id));
      }
    } catch (err) {
      if (!cancelled) {
        setActionError(err.message);
      }
    }
  }

  loadGmailAccounts();

  return () => {
    cancelled = true;
  };
}, []);

async function refreshNow() {
  const result = await getCampaignProgress(campaignId);
  setData(result);
  setLastUpdate(new Date());
  return result;
}

const statusLabels = {
  draft: "Brouillon",
  running: "En cours d'envoi",
  paused: "En pause",
  completed: "Terminée",
  failed: "Erreur",
};
async function handlePause() {
  if (!campaignId || actionLoading) return;

  try {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    await pauseCampaign(campaignId);
    await refreshNow();

    setActionMessage(
      "Pause demandée. L'email en cours peut encore être envoyé."
    );
  } catch (err) {
    setActionError(err.message);
  } finally {
    setActionLoading(false);
  }
}

async function handleResume() {
  if (!campaignId || !selectedGmailId || actionLoading) {
    return;
  }

  const confirmed = window.confirm(
    `Reprendre l'envoi vers les ${pendingCount} ` +
    "destinataires encore en attente ?"
  );

  if (!confirmed) return;

  try {
    setActionLoading(true);
    setActionError("");
    setActionMessage("");

    await resumeCampaign(
      campaignId,
      Number(selectedGmailId)
    );

    await refreshNow();

    setActionMessage(
      "Reprise demandée. Les statuts vont s'actualiser."
    );
  } catch (err) {
    setActionError(err.message);
  } finally {
    setActionLoading(false);
  }
}

  // ======================================================
  // LIVE POLLING
  // ======================================================

  useEffect(() => {

    if (!campaignId) {
      return;
    }

    let cancelled = false;


    async function loadProgress() {

      try {

        const result =
          await getCampaignProgress(
            campaignId
          );

        if (cancelled) {
          return;
        }

        setData(result);

        setError("");

        setLastUpdate(
          new Date()
        );

      } catch (err) {

        console.error(
          "LIVE TRACKING ERROR:",
          err
        );

        if (!cancelled) {

          setError(
            err?.message ||
            "Impossible de récupérer la progression."
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }


    // Premier chargement
    loadProgress();


    // Mise à jour toutes les 1.5 secondes
    const interval =
      window.setInterval(
        loadProgress,
        1500
      );


    return () => {

      cancelled = true;

      window.clearInterval(
        interval
      );

    };

  }, [campaignId]);


  // ======================================================
  // APPLICATIONS
  // ======================================================

  const applications =
    useMemo(() => {

      return Array.isArray(
        data?.applications
      )
        ? data.applications
        : [];

    }, [data]);


  // ======================================================
  // FILTER + SEARCH
  // ======================================================

  const filteredApplications =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return applications.filter(
        (application) => {

          const company =
            (
              application.company_name ||
              ""
            ).toLowerCase();

          const email =
            (
              application.company_email ||
              ""
            ).toLowerCase();

          const activity =
            (
              application.activity ||
              ""
            ).toLowerCase();


          const matchesSearch =
            !query ||
            company.includes(query) ||
            email.includes(query) ||
            activity.includes(query);


          const matchesFilter =
            filter === "all" ||
            application.status === filter;


          return (
            matchesSearch &&
            matchesFilter
          );

        }
      );

    }, [
      applications,
      search,
      filter,
    ]);


  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredApplications.length /
        ITEMS_PER_PAGE
      )
    );


  const paginatedApplications =
    useMemo(() => {

      const start =
        (currentPage - 1) *
        ITEMS_PER_PAGE;

      const end =
        start +
        ITEMS_PER_PAGE;

      return filteredApplications.slice(
        start,
        end
      );

    }, [
      filteredApplications,
      currentPage,
    ]);


  // ======================================================
  // RESET PAGE
  // ======================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    filter,
    campaignId,
  ]);


  // ======================================================
  // PAGE SECURITY
  // ======================================================

  useEffect(() => {

    if (
      currentPage >
      totalPages
    ) {

      setCurrentPage(
        totalPages
      );

    }

  }, [
    currentPage,
    totalPages,
  ]);


  // ======================================================
  // GLOBAL STATS
  // ======================================================

  const stats =
    useMemo(() => {

      const pending =
        applications.filter(
          (item) =>
            item.status === "pending"
        ).length;

      const sending =
        applications.filter(
          (item) =>
            item.status === "sending"
        ).length;

      const sent =
        applications.filter(
          (item) =>
            item.status === "sent"
        ).length;

      const failed =
        applications.filter(
          (item) =>
            item.status === "failed"
        ).length;


      return {
        total: applications.length,
        pending,
        sending,
        sent,
        failed,
      };

    }, [applications]);


  // ======================================================
  // PROGRESS
  // ======================================================

  const progress =
    useMemo(() => {

      if (!stats.total) {
        return 0;
      }

      const completed =
        stats.sent +
        stats.failed;

      return Math.round(
        (
          completed /
          stats.total
        ) *
          100
      );

    }, [stats]);


  const completed =
    stats.sent +
    stats.failed;


  // ======================================================
  // LOADING
  // ======================================================

  if (loading && !data) {

    return (

      <section className="liveTracker">

        <div className="liveTrackerLoading">

          <div className="liveLoadingIcon">

            <LoaderCircle
              size={22}
              className="liveSpin"
            />

          </div>

          <div>

            <strong>
              Connexion au suivi
            </strong>

            <span>
              Synchronisation de la campagne...
            </span>

          </div>

        </div>

      </section>

    );

  }


  // ======================================================
  // MAIN
  // ======================================================

  return (

    <motion.section

      className="liveTracker"

      initial={{
        opacity: 0,
        y: 14,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}

      transition={{
        duration: 0.4,
      }}

    >


      {/* ==================================================
          HERO
      ================================================== */}

      <div className="liveTrackerHero">


        <div className="liveTrackerHeroLeft">


          <div className="liveTrackerLogo">

            <Zap size={19} />

          </div>


          <div>

            <div className="liveTrackerHeading">

              <h2>
                Suivi des envois
              </h2>


              <div className="liveBadge">

                <span />

                LIVE

              </div>


            </div>
            <span className={`campaignState ${campaignStatus}`}>
  {statusLabels[campaignStatus] || "Statut indisponible"}
</span>



            <p>

              Campagne #{campaignId}

              <span>
                •
              </span>

              {stats.total} candidatures

            </p>

          </div>


        </div>


        <div className="liveTrackerHeroRight">


          <div className="liveConnection">

            <Wifi size={13} />

            Synchronisé

          </div>
          
<div className="liveCampaignActions">
  <select
    className="liveGmailSelect"
    value={selectedGmailId}
    onChange={(e) => setSelectedGmailId(e.target.value)}
    disabled={actionLoading || campaignStatus === "running"}
    aria-label="Compte Gmail expéditeur"
  >
    {gmailAccounts.length === 0 && (
      <option value="">Aucun Gmail connecté</option>
    )}

    {gmailAccounts.map((account) => (
      <option key={account.id} value={account.id}>
        {account.email_address}
      </option>
    ))}
  </select>

  {campaignStatus === "running" ? (
    <button
      type="button"
      className="liveActionButton livePauseButton"
      onClick={handlePause}
      disabled={actionLoading}
    >
      <Pause size={15} />
      {actionLoading ? "Patientez..." : "Pause"}
    </button>
  ) : (
    <button
      type="button"
      className="liveActionButton liveResumeButton"
      onClick={handleResume}
      disabled={
        actionLoading ||
        !campaignStatus ||
        !selectedGmailId ||
        pendingCount === 0
      }
    >
      <Play size={15} />
      {actionLoading ? "Patientez..." : "Reprendre"}
    </button>
  )}
</div>



          <div className="livePercent">

            <strong>
              {progress}%
            </strong>

            <span>
              terminé
            </span>

          </div>


        </div>


      </div>

{actionError && (
  <div className="liveActionError">
    <CircleAlert size={16} />
    {actionError}
  </div>
)}

{actionMessage && (
  <div className="liveActionMessage">
    <Check size={16} />
    {actionMessage}
  </div>
)}
      {/* ==================================================
          PROGRESS
      ================================================== */}

      <div className="liveProgressSection">


        <div className="liveProgressTop">

          <span>
            Progression globale
          </span>

          <strong>
            {completed} / {stats.total}
          </strong>

        </div>


        <div className="liveProgressTrack">

          <motion.div

            className="liveProgressValue"

            initial={{
              width: 0,
            }}

            animate={{
              width: `${progress}%`,
            }}

            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}

          />

        </div>


        <div className="liveProgressBottom">

          <span>

            {stats.pending > 0
              ? `${stats.pending} candidature${
                  stats.pending > 1
                    ? "s"
                    : ""
                } en attente`
              : "Toutes les candidatures ont été traitées"}

          </span>


          {lastUpdate && (

            <span>

              Actualisé à{" "}

              {lastUpdate.toLocaleTimeString(
                "fr-FR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }
              )}

            </span>

          )}

        </div>


      </div>


      {/* ==================================================
          STAT CARDS
      ================================================== */}

      <div className="liveStats">


        <LiveStatCard

          type="pending"

          icon={
            <Clock3 size={18} />
          }

          value={
            stats.pending
          }

          title="En attente"

          description="À envoyer"

        />


        <LiveStatCard

          type="sending"

          icon={
            <LoaderCircle
              size={18}
              className={
                stats.sending > 0
                  ? "liveSpin"
                  : ""
              }
            />
          }

          value={
            stats.sending
          }

          title="En cours"

          description="Envoi maintenant"

          active={
            stats.sending > 0
          }

        />


        <LiveStatCard

          type="sent"

          icon={
            <Check size={18} />
          }

          value={
            stats.sent
          }

          title="Envoyées"

          description="Avec succès"

        />


        <LiveStatCard

          type="failed"

          icon={
            <TriangleAlert
              size={18}
            />
          }

          value={
            stats.failed
          }

          title="Échecs"

          description="À vérifier"

        />


      </div>


      {/* ==================================================
          STREAM
      ================================================== */}

      <div className="liveStream">


        {/* HEADER */}

        <div className="liveStreamHeader">


          <div>

            <div className="liveStreamTitle">

              <Send size={15} />

              <h3>
                Flux d'envoi
              </h3>

            </div>


            <p>
              Suivez chaque candidature en temps réel
            </p>

          </div>


          <div className="liveStreamStatus">

            <span />

            Mise à jour automatique

          </div>


        </div>


        {/* ==================================================
            TOOLBAR
        ================================================== */}

        <div className="liveToolbar">


          <div className="liveSearch">

            <Search size={16} />

            <input

              value={search}

              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }

              placeholder="Rechercher une entreprise ou un email..."

            />

          </div>


          <div className="liveFilters">


            <LiveFilterButton

              active={
                filter === "all"
              }

              onClick={() =>
                setFilter("all")
              }

              label="Tous"

              count={
                stats.total
              }

            />


            <LiveFilterButton

              active={
                filter === "pending"
              }

              onClick={() =>
                setFilter("pending")
              }

              label="Attente"

              count={
                stats.pending
              }

            />


            <LiveFilterButton

              active={
                filter === "sending"
              }

              onClick={() =>
                setFilter("sending")
              }

              label="En cours"

              count={
                stats.sending
              }

            />


            <LiveFilterButton

              active={
                filter === "sent"
              }

              onClick={() =>
                setFilter("sent")
              }

              label="Envoyés"

              count={
                stats.sent
              }

            />


            <LiveFilterButton

              active={
                filter === "failed"
              }

              onClick={() =>
                setFilter("failed")
              }

              label="Échecs"

              count={
                stats.failed
              }

            />


          </div>


        </div>


        {/* ==================================================
            TABLE HEADER
        ================================================== */}

        <div className="liveTableHeader">

          <span>
            ENTREPRISE
          </span>

          <span>
            ACTIVITÉ
          </span>

          <span>
            EMAIL
          </span>

          <span>
            STATUT
          </span>

        </div>


        {/* ==================================================
            ROWS
        ================================================== */}

        <div className="liveEmailList">


          <AnimatePresence mode="popLayout">


            {paginatedApplications.map(
              (
                application,
                index
              ) => (

                <motion.div

                  layout

                  key={
                    application.id
                  }

                  className={
                    `liveEmailRow ${
                      application.status ||
                      "pending"
                    }`
                  }

                  initial={{
                    opacity: 0,
                    y: 8,
                  }}

                  animate={{
                    opacity: 1,
                    y: 0,
                  }}

                  exit={{
                    opacity: 0,
                    y: -5,
                  }}

                  transition={{
                    duration: 0.22,
                    delay:
                      Math.min(
                        index * 0.025,
                        0.15
                      ),
                  }}

                >


                  {/* COMPANY */}

                  <div className="liveCompany">


                    <CompanyAvatar

                      name={
                        application.company_name
                      }

                      status={
                        application.status
                      }

                    />


                    <div>

                      <strong>

                        {
                          application.company_name ||
                          "Entreprise"
                        }

                      </strong>


                      <span>

                        Candidature #

                        {
                          application.id
                        }

                      </span>

                    </div>


                  </div>


                  {/* ACTIVITY */}

                  <div className="liveActivity">

                    {
                      application.activity ||
                      "Non renseignée"
                    }

                  </div>


                  {/* EMAIL */}

                  <div className="liveEmailAddress">

                    <Mail size={13} />

                    <span>

                      {
                        application.company_email ||
                        "Email indisponible"
                      }

                    </span>

                  </div>


                  {/* STATUS */}

                  <EmailStatus

                    status={
                      application.status
                    }

                  />


                </motion.div>

              )
            )}


          </AnimatePresence>


          {/* EMPTY */}

          {filteredApplications.length === 0 && (

            <div className="liveEmpty">

              <div>

                <Search size={20} />

              </div>

              <strong>
                Aucun résultat
              </strong>

              <span>
                Aucune candidature ne correspond à ce filtre.
              </span>

            </div>

          )}


        </div>


        {/* ==================================================
            PAGINATION
        ================================================== */}

        {filteredApplications.length > 0 && (

          <div className="livePagination">


            <div className="livePaginationInfo">

              Affichage{" "}

              <strong>

                {
                  (
                    currentPage -
                    1
                  ) *
                    ITEMS_PER_PAGE +
                  1
                }

              </strong>

              {" – "}

              <strong>

                {
                  Math.min(
                    currentPage *
                      ITEMS_PER_PAGE,

                    filteredApplications.length
                  )
                }

              </strong>

              {" sur "}

              <strong>

                {
                  filteredApplications.length
                }

              </strong>

            </div>


            <div className="livePaginationControls">


              <button

                type="button"

                disabled={
                  currentPage === 1
                }

                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        1,
                        page - 1
                      )
                  )
                }

              >

                <ChevronLeft
                  size={15}
                />

              </button>


              <div className="livePageNumber">

                Page{" "}

                <strong>
                  {currentPage}
                </strong>

                {" / "}

                {totalPages}

              </div>


              <button

                type="button"

                disabled={
                  currentPage ===
                  totalPages
                }

                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        totalPages,
                        page + 1
                      )
                  )
                }

              >

                <ChevronRight
                  size={15}
                />

              </button>


            </div>


          </div>

        )}


      </div>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (

        <div className="liveTrackerError">

          <CircleAlert
            size={15}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="liveTrackerFooter">


        <div>

          <span className="livePulse" />

          Suivi en temps réel actif

        </div>


        <span>

          {
            stats.total
          } candidature{
            stats.total > 1
              ? "s"
              : ""
          }

        </span>


      </div>


    </motion.section>

  );

}


// ========================================================
// STAT CARD
// ========================================================

function LiveStatCard({
  type,
  icon,
  value,
  title,
  description,
  active = false,
}) {

  return (

    <motion.div

      className={
        `liveStatCard ${type} ${
          active
            ? "active"
            : ""
        }`
      }

      whileHover={{
        y: -2,
      }}

      transition={{
        duration: 0.18,
      }}

    >


      <div className="liveStatIcon">

        {icon}

      </div>


      <div className="liveStatContent">

        <strong>
          {value}
        </strong>

        <span>
          {title}
        </span>

        <small>
          {description}
        </small>

      </div>


      {active && (

        <div className="liveStatActive">

          <span />

          LIVE

        </div>

      )}


    </motion.div>

  );

}


// ========================================================
// FILTER BUTTON
// ========================================================

function LiveFilterButton({
  active,
  onClick,
  label,
  count,
}) {

  return (

    <button

      type="button"

      className={
        `liveFilterButton ${
          active
            ? "active"
            : ""
        }`
      }

      onClick={
        onClick
      }

    >

      {label}

      <span>
        {count}
      </span>

    </button>

  );

}


// ========================================================
// EMAIL STATUS
// ========================================================

function EmailStatus({
  status,
}) {

  const statuses = {

    pending: {
      label: "En attente",
      icon: (
        <Clock3
          size={13}
        />
      ),
    },

    sending: {
      label: "Envoi...",
      icon: (
        <LoaderCircle
          size={13}
          className="liveSpin"
        />
      ),
    },

    sent: {
      label: "Envoyé",
      icon: (
        <Check
          size={13}
        />
      ),
    },

    failed: {
      label: "Échec",
      icon: (
        <TriangleAlert
          size={13}
        />
      ),
    },

  };


  const current =
    statuses[status] ||
    statuses.pending;


  return (

    <motion.div

      layout

      className={
        `liveEmailStatus ${
          status ||
          "pending"
        }`
      }

      initial={false}

      animate={{
        scale:
          status === "sending"
            ? 1.02
            : 1,
      }}

    >

      {current.icon}

      <span>
        {current.label}
      </span>

    </motion.div>

  );

}


// ========================================================
// COMPANY AVATAR
// ========================================================

function CompanyAvatar({
  name,
  status,
}) {

  const initials =
    (name || "Entreprise")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0]
            ?.toUpperCase()
      )
      .join("");


  return (

    <div
      className={
        `liveCompanyAvatar ${
          status ||
          "pending"
        }`
      }
    >

      {initials || "EN"}


      {status === "sending" && (

        <span className="liveAvatarPulse" />

      )}


      {status === "sent" && (

        <span className="liveAvatarCheck">

          <Check size={8} />

        </span>

      )}


    </div>

  );

}