import {
  useEffect,
  useMemo,
  useState,
} from "react";
import LiveCampaignTracker
  from "../components/LiveCampaignTracker";
import { motion } from "framer-motion";

import {
  useSearchParams,
} from "react-router-dom";

import {
  Search,
  SlidersHorizontal,
  Send,
  Building2,
  Clock3,
  Mail,
  BriefcaseBusiness,
  MapPin,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  getApplications,
   getCampaignProgress,
  getEmailAccounts,
  pauseCampaign,
  resumeCampaign,
} from "../services/api";


const ITEMS_PER_PAGE = 10;


export default function Applications() {

  // =====================================================
  // URL
  // =====================================================

  const [searchParams] =
    useSearchParams();

  const campaignId =
    searchParams.get("campaign");



    
const [campaignStatus, setCampaignStatus] = useState("");
const [campaignProgress, setCampaignProgress] = useState(null);
const [emailAccounts, setEmailAccounts] = useState([]);
const [selectedEmailId, setSelectedEmailId] = useState("");
const [campaignActionLoading, setCampaignActionLoading] = useState(false);
const [campaignActionError, setCampaignActionError] = useState("");
const [campaignActionMessage, setCampaignActionMessage] = useState("");

useEffect(() => {
  if (!campaignId) return;

  let cancelled = false;

  async function refreshCampaign() {
    try {
      const progress = await getCampaignProgress(campaignId);

      if (cancelled) return;

      setCampaignProgress(progress);
      setCampaignStatus(progress.status || "");

      // Actualiser aussi les données du tableau.
      const data = await getApplications();
      if (!cancelled) {
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (!cancelled) {
        setCampaignActionError(err.message);
      }
    }
  }

  refreshCampaign();
  const interval = setInterval(refreshCampaign, 3000);

  return () => {
    cancelled = true;
    clearInterval(interval);
  };
}, [campaignId]);

useEffect(() => {
  let cancelled = false;

  async function loadAccounts() {
    try {
      const data = await getEmailAccounts();
      if (cancelled) return;

      const gmail = (data.accounts || []).filter(
        (account) =>
          account.provider === "gmail" &&
          account.is_active
      );

      setEmailAccounts(gmail);
      if (gmail.length) {
        setSelectedEmailId(String(gmail[0].id));
      }
    } catch (err) {
      if (!cancelled) setCampaignActionError(err.message);
    }
  }

  loadAccounts();

  return () => {
    cancelled = true;
  };
}, []);

async function handlePauseCampaign() {
  if (!campaignId || campaignActionLoading) return;

  try {
    setCampaignActionLoading(true);
    setCampaignActionError("");
    setCampaignActionMessage("");

    const result = await pauseCampaign(campaignId);
    setCampaignStatus(result.status);
    setCampaignActionMessage(
      "Pause demandée. L'envoi en cours peut se terminer."
    );
  } catch (err) {
    setCampaignActionError(err.message);
  } finally {
    setCampaignActionLoading(false);
  }
}

async function handleResumeCampaign() {
  if (!campaignId || !selectedEmailId || campaignActionLoading) return;

  const confirmed = window.confirm(
    "Reprendre les envois vers les destinataires encore en attente ?"
  );
  if (!confirmed) return;

  try {
    setCampaignActionLoading(true);
    setCampaignActionError("");
    setCampaignActionMessage("");

    const result = await resumeCampaign(
      campaignId,
      Number(selectedEmailId)
    );

    setCampaignStatus(result.status);
    setCampaignActionMessage("Reprise de la campagne demandée.");
  } catch (err) {
    setCampaignActionError(err.message);
  } finally {
    setCampaignActionLoading(false);
  }
}



  // =====================================================
  // STATES
  // =====================================================

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    activeFilter,
    setActiveFilter,
  ] = useState("all");

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);


  // =====================================================
  // LOAD APPLICATIONS
  // =====================================================

  useEffect(() => {

    let cancelled = false;

    async function loadApplications() {

      try {

        setLoading(true);
        setError("");

        const data =
          await getApplications();

        console.log(
          "APPLICATIONS DB:",
          data
        );

        if (!cancelled) {

          setApplications(
            Array.isArray(data)
              ? data
              : []
          );

        }

      } catch (err) {

        console.error(
          "Erreur applications:",
          err
        );

        if (!cancelled) {

          setError(
            "Impossible de charger les candidatures."
          );

        }

      } finally {

        if (!cancelled) {
          setLoading(false);
        }

      }

    }

    loadApplications();

    return () => {
      cancelled = true;
    };

  }, []);


  // =====================================================
  // APPLICATIONS DE LA CAMPAGNE
  // =====================================================

  const campaignApplications =
    useMemo(() => {

      if (!campaignId) {
        return applications;
      }

      return applications.filter(
        (application) =>
          Number(
            application.campaign_id
          ) === Number(campaignId)
      );

    }, [
      applications,
      campaignId,
    ]);


  // =====================================================
  // FILTER + SEARCH
  // =====================================================

  const filteredApplications =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();

      return campaignApplications.filter(
        (application) => {

          const companyName =
            application.company_name
              ?.toLowerCase() || "";

          const companyEmail =
            application.company_email
              ?.toLowerCase() || "";

          const activity =
            application.activity
              ?.toLowerCase() || "";

          const address =
            application.company_address
              ?.toLowerCase() || "";


          const matchesSearch =
            !query ||
            companyName.includes(query) ||
            companyEmail.includes(query) ||
            activity.includes(query) ||
            address.includes(query);


          const matchesStatus =
            activeFilter === "all" ||
            application.status ===
              activeFilter;


          return (
            matchesSearch &&
            matchesStatus
          );

        }
      );

    }, [
      campaignApplications,
      search,
      activeFilter,
    ]);


  // =====================================================
  // STATS
  // =====================================================

  const stats =
    useMemo(() => {

      const pending =
        campaignApplications.filter(
          (item) =>
            item.status === "pending"
        ).length;

      const sent =
        campaignApplications.filter(
          (item) =>
            item.status === "sent"
        ).length;

      const responses =
        campaignApplications.filter(
          (item) =>
            item.status === "response"
        ).length;

      const interviews =
        campaignApplications.filter(
          (item) =>
            item.status === "interview"
        ).length;

      const failed =
        campaignApplications.filter(
          (item) =>
            item.status === "failed"
        ).length;

      const uniqueCompanies =
        new Set(
          campaignApplications
            .map(
              (item) =>
                item.company_name
            )
            .filter(Boolean)
        ).size;

      const campaignCount =
        new Set(
          applications
            .map(
              (item) =>
                item.campaign_id
            )
            .filter(
              (id) =>
                id !== null &&
                id !== undefined
            )
        ).size;


      return {

        total:
          campaignApplications.length,

        pending,
        sent,
        responses,
        interviews,
        failed,

        companies:
          uniqueCompanies,

        campaigns:
          campaignCount,

      };

    }, [
      campaignApplications,
      applications,
    ]);


  // =====================================================
  // PAGINATION
  // =====================================================

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


  // =====================================================
  // RESET PAGE
  // =====================================================

  useEffect(() => {

    setCurrentPage(1);

  }, [
    search,
    activeFilter,
    campaignId,
  ]);


  // =====================================================
  // SECURITY PAGE INDEX
  // =====================================================

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


  // =====================================================
  // LOADING
  // IMPORTANT :
  // TOUS LES HOOKS SONT AU-DESSUS
  // =====================================================

  if (loading) {

    return (

      <div className="applicationsPage">

        <div className="applicationsLoading">

          <LoaderCircle
            size={28}
            className="applicationsSpinner"
          />

          <span>
            Chargement des candidatures...
          </span>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="applicationsPage">


      {/* =================================================
          HEADER
      ================================================= */}

      <motion.div

        className="applicationsHeader"

        initial={{
          opacity: 0,
          y: 12,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.35,
        }}

      >

        <div>

          <span className="applicationsEyebrow">
            CANDIDATURES
          </span>

          <h1>
            Suivez vos opportunités
          </h1>

          <p>
            Retrouvez toutes vos candidatures
            et leur progression depuis un seul espace.
          </p>

        </div>


        <div className="applicationsHeaderNumbers">

          <div>

            <span>
              Total
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>


          <div
            className="applicationsHeaderSeparator"
          />


          <div>

            <span>
              Campagnes
            </span>

            <strong>
              {stats.campaigns}
            </strong>

          </div>

        </div>

      </motion.div>


      {/* =================================================
          CAMPAIGN FILTER
      ================================================= */}

      {campaignId && (

        <motion.div

          className="campaignFilterNotice"

          initial={{
            opacity: 0,
            y: 8,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

        >

          <div>

            <span>
              Campagne sélectionnée
            </span>

            <strong>
              Campagne #{campaignId}
            </strong>

          </div>

          <span className="campaignFilterCount">
            {stats.total} candidatures
          </span>

        </motion.div>

      )}


      {/* =================================================
          STATS
      ================================================= */}

{/* =================================================
    LIVE CAMPAIGN TRACKING
================================================= */}

{campaignId && (
  <LiveCampaignTracker
    campaignId={campaignId}
  />
)}



{campaignId && (
  <div className="campaign-control-panel">
    <div className="campaign-control-info">
      <h3>Contrôle de la campagne #{campaignId}</h3>
      <p>
        {campaignStatus === "running"
          ? "Les candidatures sont en cours d'envoi."
          : campaignStatus === "paused"
          ? "Campagne en pause."
          : campaignStatus === "completed"
          ? "Toutes les candidatures ont été traitées."
          : "Gérez les envois de votre campagne."}
      </p>
      {campaignProgress && (
        <span>
          {campaignProgress.sent || 0} envoyée(s) ·{" "}
          {campaignProgress.pending || 0} en attente
        </span>
      )}
    </div>

    <div className="campaign-control-actions">
      <select
        className="campaign-control-select"
        value={selectedEmailId}
        onChange={(e) => setSelectedEmailId(e.target.value)}
        disabled={campaignActionLoading || campaignStatus === "running"}
      >
        {emailAccounts.length === 0 && (
          <option value="">Aucun Gmail connecté</option>
        )}
        {emailAccounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.email_address}
          </option>
        ))}
      </select>

      {campaignStatus === "running" ? (
        <button
          type="button"
          className="campaign-control-button pause"
          onClick={handlePauseCampaign}
          disabled={campaignActionLoading}
        >
          <Clock3 size={16} />
          {campaignActionLoading ? "Patientez..." : "Pause"}
        </button>
      ) : (
        <button
          type="button"
          className="campaign-control-button resume"
          onClick={handleResumeCampaign}
          disabled={
            campaignActionLoading ||
            !selectedEmailId ||
            !campaignProgress?.pending
          }
        >
          <Send size={16} />
          {campaignActionLoading ? "Patientez..." : "Reprendre"}
        </button>
      )}
    </div>

    {campaignActionError && (
      <p className="campaign-control-error">{campaignActionError}</p>
    )}

    {campaignActionMessage && (
      <p className="campaign-control-message">{campaignActionMessage}</p>
    )}
  </div>
)}

      {/* =================================================
          CONTAINER
      ================================================= */}

      <motion.section

        className="applicationsContainer"

        initial={{
          opacity: 0,
          y: 18,
        }}

        animate={{
          opacity: 1,
          y: 0,
        }}

        transition={{
          duration: 0.4,
          delay: 0.1,
        }}

      >


        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="applicationsToolbar">

          <div className="applicationsSearch">

            <Search size={18} />

            <input

              value={search}

              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }

              placeholder={
                "Rechercher une entreprise, un email..."
              }

            />

          </div>


          <button
            type="button"
            className="applicationsFilterButton"
          >

            <SlidersHorizontal
              size={17}
            />

            Filtres

          </button>

        </div>


        {/* =================================================
            TABS
        ================================================= */}

        <div className="applicationsTabs">


          <FilterButton

            active={
              activeFilter === "all"
            }

            onClick={() =>
              setActiveFilter("all")
            }

            label="Toutes"

            value={stats.total}

          />


          <FilterButton

            active={
              activeFilter === "pending"
            }

            onClick={() =>
              setActiveFilter("pending")
            }

            label="Préparées"

            value={stats.pending}

          />


          <FilterButton

            active={
              activeFilter === "sent"
            }

            onClick={() =>
              setActiveFilter("sent")
            }

            label="Envoyées"

            value={stats.sent}

          />


          <FilterButton

            active={
              activeFilter === "response"
            }

            onClick={() =>
              setActiveFilter("response")
            }

            label="Réponses"

            value={stats.responses}

          />


          <FilterButton

            active={
              activeFilter === "interview"
            }

            onClick={() =>
              setActiveFilter("interview")
            }

            label="Entretiens"

            value={stats.interviews}

          />

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="applicationsError">
            {error}
          </div>

        )}


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="applicationsTable">


          {/* HEADER */}

          <div className="applicationsTableHeader">

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
              SCORE
            </span>

            <span>
              STATUT
            </span>

          </div>


          {/* ROWS */}

          {paginatedApplications.map(
            (application, index) => (

              <motion.div

                className="applicationRow"

                key={
                  application.id
                }

                initial={{
                  opacity: 0,
                  y: 8,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  duration: 0.25,
                  delay:
                    Math.min(
                      index * 0.025,
                      0.2
                    ),
                }}

              >


                {/* COMPANY */}

                <div className="applicationCompany">

                  <div className="applicationCompanyAvatar">

                    {
                      getInitials(
                        application
                          .company_name
                      )
                    }

                  </div>


                  <div>

                    <strong>

                      {
                        application
                          .company_name ||
                        "Entreprise"
                      }

                    </strong>


                    <span>

                      <MapPin
                        size={11}
                      />

                      {
                        application
                          .company_address ||
                        "Adresse non renseignée"
                      }

                    </span>

                  </div>

                </div>


                {/* ACTIVITY */}

                <div className="applicationActivity">

                  <BriefcaseBusiness
                    size={14}
                  />

                  <span>

                    {
                      application.activity ||
                      "Non renseignée"
                    }

                  </span>

                </div>


                {/* EMAIL */}

                <div className="applicationEmail">

                  <Mail
                    size={14}
                  />

                  <span>

                    {
                      application
                        .company_email ||
                      "Email non disponible"
                    }

                  </span>

                </div>


                {/* SCORE */}

                <div>

                  <span className="applicationScore">

                    {
                      application.score ??
                      0
                    }

                    {" "}pts

                  </span>

                </div>


                {/* STATUS */}

                <div>

                  <ApplicationStatus

                    status={
                      application.status
                    }

                  />

                </div>

              </motion.div>

            )
          )}


          {/* EMPTY */}

          {filteredApplications.length === 0 && (

            <div className="applicationsEmpty">

              <Building2
                size={30}
              />

              <strong>
                Aucune candidature
              </strong>

              <span>

                Aucune candidature ne correspond
                à votre recherche.

              </span>

            </div>

          )}

        </div>


        {/* =================================================
            PAGINATION
        ================================================= */}

        {filteredApplications.length > 0 && (

          <div className="applicationsPagination">


            <div className="paginationInfo">

              Affichage{" "}

              <strong>

                {
                  (currentPage - 1) *
                    ITEMS_PER_PAGE +
                  1
                }

              </strong>

              {" - "}

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


            <div className="paginationControls">


              {/* PREVIOUS */}

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

                aria-label="Page précédente"

              >

                <ChevronLeft
                  size={16}
                />

              </button>


              {/* PAGE NUMBERS */}

              {
                getVisiblePages(
                  currentPage,
                  totalPages
                ).map(
                  (page) => (

                    <button

                      type="button"

                      key={page}

                      className={
                        currentPage === page
                          ? "active"
                          : ""
                      }

                      onClick={() =>
                        setCurrentPage(
                          page
                        )
                      }

                    >

                      {page}

                    </button>

                  )
                )
              }


              {/* NEXT */}

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

                aria-label="Page suivante"

              >

                <ChevronRight
                  size={16}
                />

              </button>

            </div>

          </div>

        )}

      </motion.section>

    </div>

  );

}


// =========================================================
// FILTER BUTTON
// =========================================================

function FilterButton({
  active,
  onClick,
  label,
  value,
}) {

  return (

    <button

      type="button"

      className={
        active
          ? "active"
          : ""
      }

      onClick={
        onClick
      }

    >

      {label}

      <span>
        {value}
      </span>

    </button>

  );

}


// =========================================================
// STAT CARD
// =========================================================

function ApplicationStat({
  icon,
  value,
  label,
  detail,
}) {

  return (

    <motion.div

      className="applicationStatCard"

      whileHover={{
        y: -3,
      }}

      transition={{
        duration: 0.2,
      }}

    >

      <div className="applicationStatIcon">

        {icon}

      </div>


      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>


      <small>
        {detail}
      </small>

    </motion.div>

  );

}


// =========================================================
// STATUS
// =========================================================

function ApplicationStatus({
  status,
}) {

  const statuses = {

    pending: {
      label: "Préparée",
      className: "pending",
    },

    sent: {
      label: "Envoyée",
      className: "sent",
    },

    response: {
      label: "Réponse",
      className: "response",
    },

    reply: {
      label: "Réponse",
      className: "response",
    },

    interview: {
      label: "Entretien",
      className: "interview",
    },

    failed: {
      label: "Échec",
      className: "failed",
    },

  };


  const current =
    statuses[status] ||
    statuses.pending;


  return (

    <span
      className={
        `applicationStatus ${current.className}`
      }
    >

      <i />

      {current.label}

    </span>

  );

}


// =========================================================
// INITIALS
// =========================================================

function getInitials(name) {

  if (!name) {
    return "E";
  }

  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (words.length === 1) {

    return words[0]
      .slice(0, 2)
      .toUpperCase();

  }


  return (
    words[0][0] +
    words[1][0]
  ).toUpperCase();

}


// =========================================================
// PAGINATION PAGES
// =========================================================

function getVisiblePages(
  currentPage,
  totalPages
) {

  if (totalPages <= 5) {

    return Array.from(
      {
        length: totalPages,
      },
      (_, index) =>
        index + 1
    );

  }


  let start =
    Math.max(
      1,
      currentPage - 2
    );


  let end =
    Math.min(
      totalPages,
      start + 4
    );


  if (
    end - start < 4
  ) {

    start =
      Math.max(
        1,
        end - 4
      );

  }


  return Array.from(
    {
      length:
        end - start + 1,
    },
    (_, index) =>
      start + index
  );

}