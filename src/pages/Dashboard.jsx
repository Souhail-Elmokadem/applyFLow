import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCompanyStats, getApplications } from "../services/api";
import { getCurrentUser } from "../services/auth";
import DailyQuotaCard from "../components/DailyQuotaCard";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Database,
  FileText,
  Mail,
  Plus,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import ApplicationTable from "../components/ApplicationTable";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 18,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

function formatNumber(value) {
  if (value === undefined || value === null) {
    return "—";
  }

  return new Intl.NumberFormat("fr-FR").format(value);
}

export default function Dashboard() {
  const [companyStats, setCompanyStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [backendError, setBackendError] = useState(false);

  const [user, setUser] = useState(null);
const [applications, setApplications] = useState([]);
const [loadingApplications, setLoadingApplications] = useState(true);
const [accountError, setAccountError] = useState("");

useEffect(() => {
  let active = true;

  async function loadAccount() {
    const token = sessionStorage.getItem("applyflow_token");

    if (!token) {
      setAccountError("Veuillez vous reconnecter.");
      setLoadingApplications(false);
      return;
    }

    const [userResult, applicationsResult] =
      await Promise.allSettled([
        getCurrentUser(token),
        getApplications(),
      ]);

    if (!active) return;

    if (userResult.status === "fulfilled") {
      setUser(userResult.value);
    } else {
      setAccountError("Impossible de charger votre profil.");
    }

    if (applicationsResult.status === "fulfilled") {
      setApplications(
        Array.isArray(applicationsResult.value)
          ? applicationsResult.value
          : []
      );
    } else {
      setAccountError(
        "Impossible de charger vos candidatures."
      );
    }

    setLoadingApplications(false);
  }

  loadAccount();

  return () => {
    active = false;
  };
}, []);

const initials = user
  ? `${user.first_name?.charAt(0) || ""}${
      user.last_name?.charAt(0) || ""
    }`.toUpperCase()
  : "?";

const sentCount = applications.filter((application) =>
  ["sent", "envoyé", "envoyée", "envoyee"].includes(
    String(application.status || "").toLowerCase()
  )
).length;

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getCompanyStats();

        setCompanyStats(data);
        setBackendError(false);
      } catch (error) {
        console.error("Erreur backend :", error);
        setBackendError(true);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  const stats = [
    {
      label: "Entreprises",
      value: formatNumber(companyStats?.companies),
      icon: Building2,
      description: "dans votre base",
      loading: loadingStats,
    },
    {
      label: "Avec email",
      value: formatNumber(companyStats?.companies_with_email),
      icon: Mail,
      description: "contacts disponibles",
      loading: loadingStats,
    },
    {
      label: "Emails uniques",
      value: formatNumber(companyStats?.unique_emails),
      icon: Users,
      description: "après déduplication",
      loading: loadingStats,
    },
    {
        label: "Candidatures",
  value: formatNumber(sentCount),
  icon: Send,
  description: "envoyées parmi les 100 dernières",
  loading: loadingApplications,
    },
  ];

  return (
    <div className="premiumDashboard">
      {/* HEADER */}

      <motion.header
        className="premiumHeader"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div>
          <div className="welcomeTag">
            <span className="liveDot" />
            VOTRE ESPACE
          </div>

<h1>
  Bonjour {user?.first_name || ""}
  <span className="helloEmoji">👋</span>
</h1>     

          <p>
            Pilotez votre recherche et suivez vos candidatures
            depuis un seul endroit.
          </p>
        </div>

        <div className="premiumHeaderRight">
          <button className="premiumSearch">
            <Search size={17} />
            <span>Rechercher</span>
            <kbd>⌘ K</kbd>
          </button>

          <button className="premiumNotification">
            <Mail size={18} />
            <i />
          </button>

          <div className="premiumUser">
            <div className="premiumAvatar">
  {initials}
</div>

            <div>
<strong>
  {user
    ? `${user.first_name} ${user.last_name}`
    : "Chargement..."}
</strong>              <span>Compte candidat</span>
            </div>

            <ChevronRight size={15} />
          </div>

          <Link
            to="/campaign"
            className="premiumCampaignButton"
          >
            <Plus size={17} />
            Nouvelle campagne
          </Link>
        </div>
      </motion.header>

      {/* HERO */}

      <motion.section
        className="dashboardHero"
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.99,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.55,
          delay: 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="heroGlow heroGlowOne" />
        <div className="heroGlow heroGlowTwo" />

        <div className="heroContent">
          <div className="heroBadge">
            <Sparkles size={13} />
            APPLYFLOW
          </div>

          <h2>
            Votre prochaine opportunité
            <br />
            commence <span>ici.</span>
          </h2>

          <p>
            Configurez une campagne, choisissez votre CV et
            trouvez les entreprises correspondant à votre profil.
          </p>

          <div className="heroActions">
            <Link
              to="/campaign"
              className="heroPrimaryButton"
            >
              <Rocket size={17} />
              Créer une campagne
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/applications"
              className="heroSecondaryButton"
            >
              Voir mes candidatures
            </Link>
          </div>
        </div>

        <div className="heroVisual">
          <motion.div
            className="heroOrbit heroOrbitOne"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="heroOrbit heroOrbitTwo"
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="heroCenter"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="heroCenterIcon">
              <Target size={29} />
            </div>

            <strong>ApplyFlow</strong>
            <span>Job Engine</span>
          </motion.div>

          <motion.div
            className="floatingCard floatingCardOne"
            animate={{
              y: [0, -7, 0],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
            }}
          >
            <Mail size={15} />
            <div>
              <strong>
                {formatNumber(
                  companyStats?.unique_emails
                )}
              </strong>
              <span>contacts</span>
            </div>
          </motion.div>

          <motion.div
            className="floatingCard floatingCardTwo"
            animate={{
              y: [0, 7, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
            }}
          >
            <Database size={15} />
            <div>
              <strong>
                {formatNumber(
                  companyStats?.companies
                )}
              </strong>
              <span>entreprises</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* BACKEND ERROR */}
{accountError && (
  <div className="backendWarning" role="alert">
    {accountError}
  </div>
)}
      {backendError && (
        <motion.div
          className="backendWarning"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Impossible de récupérer les statistiques du backend.
          Vérifie que FastAPI tourne sur le port 8000.
        </motion.div>
      )}

      {/* STATS */}

      <motion.section
        className="premiumStatsGrid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <motion.article
              key={stat.label}
              variants={item}
              className="premiumStat"
              whileHover={{
                y: -5,
              }}
            >
              <div className="premiumStatTop">
                <div className="premiumStatIcon">
                  <Icon size={19} />
                </div>

                <div className="statMiniTrend">
                  <TrendingUp size={12} />
                  Live
                </div>
              </div>

              {stat.loading ? (
                <div className="statSkeleton" />
              ) : (
                <strong className="premiumStatNumber">
                  {stat.value}
                </strong>
              )}

              <div className="premiumStatBottom">
                <span>{stat.label}</span>
                <small>{stat.description}</small>
              </div>
            </motion.article>
          );
        })}
      </motion.section>


      <DailyQuotaCard />

        <div className="c" style={{ marginTop: "20px" }}></div>

        
      {/* MAIN CONTENT */}

      <div className="premiumDashboardGrid">
        <motion.section
          className="premiumPanel recentPanel"
          variants={item}
          initial="hidden"
          animate="show"
        >
          <div className="premiumPanelHeader">
            <div>
              <span className="sectionEyebrow">
                ACTIVITÉ
              </span>

              <h3>Candidatures récentes</h3>

              <p>
                Retrouvez les dernières actions de vos
                campagnes.
              </p>
            </div>

            <Link to="/applications">
              Voir toutes
              <ArrowRight size={14} />
            </Link>
          </div>

          <ApplicationTable />
        </motion.section>

        <div className="premiumRightColumn">
          {/* START CARD */}

          <motion.section
            className="premiumPanel launchCard"
            variants={item}
            initial="hidden"
            animate="show"
            transition={{
              delay: 0.15,
            }}
          >
            <div className="launchTop">
              <div className="launchIcon">
                <Rocket size={21} />
              </div>

              <span>PRÊT À COMMENCER</span>
            </div>

            <h3>
              Lancez votre première campagne
            </h3>

            <p>
              Définissez votre recherche et sélectionnez
              les entreprises pertinentes.
            </p>

            <div className="launchSteps">
              <div>
                <span>01</span>
                <p>Choisir le poste</p>
              </div>

              <div>
                <span>02</span>
                <p>Sélectionner le CV</p>
              </div>

              <div>
                <span>03</span>
                <p>Préparer la campagne</p>
              </div>
            </div>

            <Link
              to="/campaign"
              className="launchButton"
            >
              Commencer
              <ArrowRight size={15} />
            </Link>
          </motion.section>

          {/* PROFILE */}

          <motion.section
            className="premiumPanel premiumProfile"
            variants={item}
            initial="hidden"
            animate="show"
            transition={{
              delay: 0.22,
            }}
          >
            <div className="profileHeader">
              <div>
                <span className="sectionEyebrow">
                  VOTRE PROFIL
                </span>

                <h3>Configuration</h3>
              </div>

              <div className="profilePercentage">
                85%
              </div>
            </div>

            <div className="profileProgress">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "85%" }}
                transition={{
                  duration: 1.2,
                  delay: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>

            <div className="premiumChecklist">
              <div>
                <span className="checkIcon done">
                  <CheckCircle2 size={15} />
                </span>

                <div>
                  <strong>CV principal</strong>
                  <small>Document ajouté</small>
                </div>
              </div>

              <div>
                <span className="checkIcon done">
                  <CheckCircle2 size={15} />
                </span>

                <div>
                  <strong>Critères</strong>
                  <small>Recherche configurée</small>
                </div>
              </div>

              <div>
                <span className="checkIcon">
                  <FileText size={15} />
                </span>

                <div>
                  <strong>Expériences</strong>
                  <small>À compléter</small>
                </div>
              </div>
            </div>

            <Link
              to="/settings"
              className="completeProfile"
            >
              Compléter mon profil
              <ArrowRight size={14} />
            </Link>
          </motion.section>
        </div>
      </div>
    </div>
  );
}