import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  Send,
  Sparkles,
} from "lucide-react";

export default function Landing() {
  return (
    <div className="website">
      <nav className="navbar">
        <Link className="logo" to="/">
          <div className="logoIcon">A</div>
          ApplyFlow
        </Link>

        <div className="navLinks">
          <a href="#features">Fonctionnalités</a>
          <a href="#how">Comment ça marche</a>
          <a href="#pricing">Tarifs</a>
        </div>

        <div className="navActions">
          <Link className="loginButton" to="/login">
            Connexion
          </Link>

          <Link className="primarySmall" to="/register">
            Commencer
            <ArrowRight size={17} />
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="badge">
            <Sparkles size={15} />
            Votre recherche d'emploi, simplifiée
          </div>

          <h1>
            Postulez plus intelligemment.
            <span> Trouvez votre prochaine opportunité.</span>
          </h1>

          <p className="heroDescription">
            Importez votre CV, définissez vos critères et centralisez
            vos candidatures depuis un seul espace.
          </p>

          <div className="heroButtons">
            <Link className="primaryLarge" to="/register">
              Commencer gratuitement
              <ArrowRight size={19} />
            </Link>

            <a className="secondaryLarge" href="#how">
              Découvrir ApplyFlow
            </a>
          </div>

          <div className="trust">
            <CheckCircle2 size={17} />
            Configuration en quelques minutes
            <span>•</span>
            CV sécurisé
            <span>•</span>
            Suivi centralisé
          </div>

          <DashboardPreview />
        </section>

        <section className="features" id="features">
          <div className="sectionHeader">
            <span>TOUT AU MÊME ENDROIT</span>
            <h2>Concentrez-vous sur les entretiens.</h2>
            <p>
              ApplyFlow vous aide à organiser les étapes répétitives
              de votre recherche d'emploi.
            </p>
          </div>

          <div className="featureGrid">
            <Feature
              icon={<FileText />}
              title="Importez votre CV"
              text="Ajoutez votre CV et gérez vos documents depuis votre espace personnel."
            />

            <Feature
              icon={<Search />}
              title="Définissez vos critères"
              text="Poste, contrat, localisation et domaine : gardez uniquement les opportunités pertinentes."
            />

            <Feature
              icon={<Send />}
              title="Gérez vos candidatures"
              text="Préparez, envoyez et suivez vos candidatures depuis un tableau de bord unique."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="featureCard">
      <div className="featureIcon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboardPreview">
      <div className="previewSidebar">
        <div className="previewLogo">A</div>

        <div className="sideItem active"></div>
        <div className="sideItem"></div>
        <div className="sideItem"></div>
        <div className="sideItem"></div>
      </div>

      <div className="previewContent">
        <div className="previewTop">
          <div>
            <small>TABLEAU DE BORD</small>
            <h3>Bonjour Mohammed 👋</h3>
          </div>

          <div className="avatar">MA</div>
        </div>

        <div className="stats">
          <Stat number="127" label="Candidatures" />
          <Stat number="18" label="Réponses" />
          <Stat number="6" label="Entretiens" />
        </div>

        <div className="activity">
          <div className="activityHeader">
            <strong>Activité récente</strong>
            <span>Voir tout</span>
          </div>

          <Application company="NovaTech" job="Data Analyst" />
          <Application company="Cloudia" job="AI Engineer" />
          <Application company="DataSphere" job="Data Scientist" pending />
        </div>
      </div>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="stat">
      <strong>{number}</strong>
      <span>{label}</span>
    </div>
  );
}

function Application({ company, job, pending }) {
  return (
    <div className="application">
      <div className="companyLogo">{company[0]}</div>

      <div className="companyInfo">
        <strong>{company}</strong>
        <span>{job}</span>
      </div>

      <div className={pending ? "status pending" : "status sent"}>
        {pending ? "En attente" : "Envoyée"}
      </div>
    </div>
  );
}