import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEmailAccounts } from "../services/api";
import {
  getTargetCompanies,
  createCampaign,
    uploadCampaignCV,
    launchCampaign
} from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Globe2,
  Mail,
  MapPin,
  Rocket,
  Search,
  Send,
  Sparkles,
  Target,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";


/* =====================================================
   CONFIGURATION
===================================================== */

const steps = [
  {
    id: 1,
    label: "Recherche",
    icon: Target,
  },
  {
    id: 2,
    label: "CV",
    icon: FileText,
  },
  {
    id: 3,
    label: "Ciblage",
    icon: Building2,
  },
  {
    id: 4,
    label: "Message",
    icon: Mail,
  },
  {
    id: 5,
    label: "Validation",
    icon: Rocket,
  },
];


const sectors = [
  "Data / IA",
  "Développement",
  "Cybersécurité",
  "Cloud / DevOps",
  "Finance",
  "Ressources humaines",
  "Conseil",
];


/* =====================================================
   CAMPAIGN
===================================================== */

export default function Campaign() {
const navigate = useNavigate();

const [launching, setLaunching] = useState(false);
const [launchError, setLaunchError] = useState("");




const [emailAccounts, setEmailAccounts] = useState([]);
const [selectedEmailId, setSelectedEmailId] = useState("");

const [sendError, setSendError] = useState("");

useEffect(() => {
  let active = true;

  async function loadEmailAccounts() {
    try {
      const data = await getEmailAccounts();

      if (!active) return;

      const gmail = (data.accounts || []).filter(
        (account) =>
          account.provider === "gmail" &&
          account.is_active
      );

      setEmailAccounts(gmail);

      if (gmail.length > 0) {
        setSelectedEmailId(String(gmail[0].id));
      }
    } catch (error) {
      if (active) {
        setSendError(error.message);
      }
    }
  }

  loadEmailAccounts();

  return () => {
    active = false;
  };
}, []);






  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    sector: "Data / IA",
    job: "",
    location: "",
    contract: "Stage",
  });

  const [cv, setCv] = useState(null);


  const [targeting, setTargeting] = useState({
    limit: 100,
    excludeContacted: true,
    uniqueCompany: true,
    validEmailsOnly: true,
  });


  const [subject, setSubject] = useState(
    "Candidature – {{poste}} – Mohammed Assim"
  );


  const [message, setMessage] = useState(
`Bonjour,

Je me permets de vous contacter afin de vous proposer ma candidature pour une opportunité en {{poste}} au sein de {{entreprise}}.

Mon parcours et mes compétences correspondent au domaine de votre entreprise. Vous trouverez mon CV en pièce jointe pour plus d'informations.

Je reste à votre disposition pour tout échange complémentaire.

Cordialement,
Mohammed Assim`
  );


  function updateForm(field, value) {

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

  }


  function next() {

    setStep((current) =>
      Math.min(current + 1, 5)
    );

  }


  function previous() {

    setStep((current) =>
      Math.max(current - 1, 1)
    );

  }
async function handleLaunchCampaign() {
  if (!selectedEmailId) {
  setLaunchError(
    "Veuillez connecter et sélectionner un compte Gmail."
  );
  return;
}
  if (!cv) {
    setLaunchError(
      "Veuillez sélectionner votre CV avant de lancer la campagne."
    );
    setStep(2);
    return;
  }

  if (launching) {
    return;
  }

  try {
    setLaunching(true);
    setLaunchError("");

    // ============================================
    // 1. CRÉATION CAMPAGNE
    // ============================================

    const payload = {
      title:
        form.title?.trim() ||
        (form.job?.trim()
          ? `Campagne ${form.job.trim()}`
          : "Nouvelle campagne"),

      job: form.job?.trim() || "",
      sector: form.sector?.trim() || "",
      location: form.location?.trim() || "",
      contract: form.contract?.trim() || "",
      limit: Number(targeting.limit) || 100,
      subject: subject?.trim() || "",
      message: message?.trim() || "",
    };

    console.log(
      "1️⃣ Création campagne :",
      payload
    );

    const result =
      await createCampaign(payload);

    console.log(
      "2️⃣ Campagne créée :",
      result
    );

    const campaignId =
      result.campaign_id;

    if (!campaignId) {
      throw new Error(
        "Le backend n'a pas retourné campaign_id."
      );
    }

    // ============================================
    // 2. UPLOAD CV
    // ============================================

    console.log(
      "3️⃣ Upload CV..."
    );

    const cvResult =
      await uploadCampaignCV(
        campaignId,
        cv
      );

    console.log(
      "4️⃣ CV uploadé :",
      cvResult
    );

    // ============================================
    // 3. LANCEMENT / ENVOI EMAILS
    // ============================================

    console.log(
      "5️⃣ Lancement campagne :",
      campaignId
    );

    const launchResult = await launchCampaign(
  campaignId,
  Number(selectedEmailId)
);

    console.log(
      "6️⃣ Résultat envoi :",
      launchResult
    );

    // ============================================
    // 4. REDIRECTION
    // ============================================

    navigate(
      `/applications?campaign=${campaignId}`
    );

  } catch (error) {

    console.error(
      "❌ Erreur lancement campagne :",
      error
    );

    setLaunchError(
      error?.message ||
      "Impossible de lancer la campagne."
    );

  } finally {

    setLaunching(false);

  }
}

  return (

    <div className="campaignPageV3">


      {/* =================================================
          HEADER
      ================================================= */}

      <motion.header
        className="campaignHeaderV3"
        initial={{
          opacity: 0,
          y: -12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
      >

        <div>

          <span className="campaignEyebrow">
            NOUVELLE CAMPAGNE
          </span>

          <h1>
            Créez votre campagne
          </h1>

          <p>
            Configurez votre recherche et préparez
            votre campagne en quelques étapes.
          </p>

        </div>


        <div className="campaignDraft">

          <span />

          Brouillon sauvegardé

        </div>

      </motion.header>


      {/* =================================================
          STEPPER
      ================================================= */}

      <motion.div
        className="campaignStepper"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.1,
        }}
      >

        {steps.map((item, index) => {

          const Icon = item.icon;

          const active =
            item.id === step;

          const completed =
            item.id < step;


          return (

            <div
              className="stepWrapper"
              key={item.id}
            >

              <button
                type="button"
                className={[
                  "campaignStep",
                  active ? "active" : "",
                  completed
                    ? "completed"
                    : "",
                ].join(" ")}
                onClick={() => {

                  if (item.id <= step) {

                    setStep(item.id);

                  }

                }}
              >

                <div className="campaignStepIcon">

                  {completed ? (

                    <Check size={16} />

                  ) : (

                    <Icon size={17} />

                  )}

                </div>


                <div>

                  <span>
                    Étape {item.id}
                  </span>

                  <strong>
                    {item.label}
                  </strong>

                </div>

              </button>


              {index !==
                steps.length - 1 && (

                <div
                  className={
                    completed
                      ? "stepLine completed"
                      : "stepLine"
                  }
                />

              )}

            </div>

          );

        })}

      </motion.div>


      {/* =================================================
          BODY
      ================================================= */}

      <div className="campaignLayoutV3">

        <motion.main
          className="campaignMainCard"
          layout
        >

          <AnimatePresence mode="wait">


            {/* STEP 1 */}

            {step === 1 && (

              <StepSearch
                key="search"
                form={form}
                updateForm={updateForm}
              />

            )}


            {/* STEP 2 */}

            {step === 2 && (

              <StepCV
                key="cv"
                cv={cv}
                setCv={setCv}
              />

            )}


            {/* STEP 3 */}

            {step === 3 && (

              <StepTargeting
                key="targeting"
                targeting={targeting}
                setTargeting={setTargeting}
                form={form}
              />

            )}


            {/* STEP 4 */}

            {step === 4 && (

              <StepMessage
                key="message"
                subject={subject}
                setSubject={setSubject}
                message={message}
                setMessage={setMessage}
              />

            )}


            {/* STEP 5 */}

           
{/* STEP 5 */}

{step === 5 && (
  <div key="validation">
    <StepValidation
      form={form}
      cv={cv}
      targeting={targeting}
      subject={subject}
    />

    <div className="campaign-email-panel">
      <div className="campaign-email-header">
        <h3>Compte d'envoi Gmail</h3>
        <p>Sélectionnez votre adresse d'expédition.</p>
      </div>

      {emailAccounts.length > 0 ? (
        <select
          className="campaign-email-select"
          value={selectedEmailId}
          onChange={(e) =>
            setSelectedEmailId(e.target.value)
          }
        >
          {emailAccounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.email_address}
            </option>
          ))}
        </select>
      ) : (
        <p className="campaign-email-warning">
          Aucun compte Gmail connecté.
          Connectez votre compte dans Paramètres.
        </p>
      )}

      {sendError && (
        <p className="campaign-email-error">
          {sendError}
        </p>
      )}
    </div>
  </div>
)}


          </AnimatePresence>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="campaignFooter">

            <button
              type="button"
              className="campaignBackButton"
              disabled={step === 1}
              onClick={previous}
            >

              <ArrowLeft size={17} />

              Retour

            </button>


            {step < 5 ? (

              <button
                type="button"
                className="campaignNextButton"
                onClick={next}
              >

                Continuer

                <ArrowRight size={17} />

              </button>

            ) : (

            <motion.button
  type="button"
  className="launchCampaignButton"

  onClick={handleLaunchCampaign}

  disabled={launching}

  whileHover={
    launching
      ? {}
      : { scale: 1.015 }
  }

  whileTap={
    launching
      ? {}
      : { scale: 0.985 }
  }
>
  {launching ? (
    <>
      <span className="launchSpinner" />
      Création de la campagne...
    </>
  ) : (
    <>
      <Send size={18} />
      Lancer la campagne
    </>
  )}
</motion.button>


            )}

            {launchError && (
  <motion.div
    className="campaignLaunchError"
    initial={{
      opacity: 0,
      y: -5,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
  >
    {launchError}
  </motion.div>
)}

          </div>

        </motion.main>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <CampaignSummary
          step={step}
          form={form}
          cv={cv}
          targeting={targeting}
        />

      </div>

    </div>

  );

}


/* =====================================================
   STEP 1 — SEARCH
===================================================== */

function StepSearch({
  form,
  updateForm,
}) {

  return (

    <StepAnimation>

      <StepHeading
        number="01"
        icon={
          <Target size={21} />
        }
        title="Que recherchez-vous ?"
        description="Définissez les critères utilisés pour identifier les entreprises pertinentes."
      />


      <div className="campaignForm">


        {/* NOM CAMPAGNE */}

        <FormField
          label="Nom de la campagne"
          full
        >

          <input
            value={form.title}
            onChange={(event) =>
              updateForm(
                "title",
                event.target.value
              )
            }
            placeholder="Ex : Stage Data / IA — Septembre"
          />

        </FormField>


        {/* POSTE */}

        <FormField
          label="Poste recherché"
        >

          <div className="inputWithIcon">

            <BriefcaseBusiness
              size={17}
            />

            <input
              value={form.job}
              onChange={(event) =>
                updateForm(
                  "job",
                  event.target.value
                )
              }
              placeholder="Data Analyst"
            />

          </div>

        </FormField>


        {/* LOCALISATION */}

        <FormField
          label="Localisation"
        >

          <div className="inputWithIcon">

            <MapPin size={17} />

            <input
              value={form.location}
              onChange={(event) =>
                updateForm(
                  "location",
                  event.target.value
                )
              }
              placeholder="Paris, France"
            />

          </div>

        </FormField>


        {/* DOMAINE */}

        <FormField
          label="Domaine"
          full
        >

          <div className="sectorGrid">

            {sectors.map((sector) => (

              <button
                key={sector}
                type="button"
                onClick={() =>
                  updateForm(
                    "sector",
                    sector
                  )
                }
                className={
                  form.sector === sector
                    ? "sectorOption active"
                    : "sectorOption"
                }
              >

                {form.sector ===
                  sector && (

                  <CheckCircle2
                    size={15}
                  />

                )}

                {sector}

              </button>

            ))}

          </div>

        </FormField>


        {/* CONTRACT */}

        <FormField
          label="Type de contrat"
          full
        >

          <div className="contractOptions">

            {[
              "Stage",
              "Alternance",
              "CDI",
              "CDD",
            ].map((contract) => (

              <button
                key={contract}
                type="button"
                onClick={() =>
                  updateForm(
                    "contract",
                    contract
                  )
                }
                className={
                  form.contract ===
                  contract
                    ? "contractOption active"
                    : "contractOption"
                }
              >

                <span />

                {contract}

              </button>

            ))}

          </div>

        </FormField>

      </div>

    </StepAnimation>

  );

}


/* =====================================================
   STEP 2 — CV
===================================================== */

function StepCV({
  cv,
  setCv,
}) {

  return (

    <StepAnimation>

      <StepHeading
        number="02"
        icon={
          <FileText size={21} />
        }
        title="Sélectionnez votre CV"
        description="Ce document sera joint aux candidatures de cette campagne."
      />


      {!cv ? (

        <label className="campaignUploadZone">

          <input
            type="file"
            accept=".pdf"
            hidden
            onChange={(event) => {

              const file =
                event.target.files?.[0];

              if (file) {

                setCv(file);

              }

            }}
          />


          <motion.div
            className="uploadIllustration"
            whileHover={{
              scale: 1.04,
            }}
          >

            <Upload size={25} />

          </motion.div>


          <h3>
            Déposez votre CV ici
          </h3>

          <p>
            Glissez votre fichier ou cliquez
            pour parcourir votre ordinateur.
          </p>

          <span>
            PDF • 10 MB maximum
          </span>


          <div className="uploadButtonFake">

            <Upload size={15} />

            Choisir un fichier

          </div>

        </label>

      ) : (

        <motion.div
          className="selectedCVCard"
          initial={{
            opacity: 0,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
        >

          <div className="selectedCVIcon">

            <FileText size={26} />

          </div>


          <div className="selectedCVInfo">

            <strong>
              {cv.name}
            </strong>

            <span>

              {(cv.size / 1024 / 1024)
                .toFixed(2)}

              {" "}MB • PDF

            </span>

          </div>


          <div className="cvReady">

            <CheckCircle2 size={16} />

            Prêt

          </div>


          <button
            type="button"
            onClick={() =>
              setCv(null)
            }
          >

            <X size={16} />

          </button>

        </motion.div>

      )}


      <div className="cvTip">

        <div>

          <Sparkles size={18} />

        </div>


        <div>

          <strong>
            Conseil ApplyFlow
          </strong>

          <p>
            Utilisez un CV adapté au poste
            recherché pour obtenir de meilleurs
            résultats.
          </p>

        </div>

      </div>

    </StepAnimation>

  );

}


/* =====================================================
   STEP 3 — TARGETING
===================================================== */

function StepTargeting({
  targeting,
  setTargeting,
  form,
}) {

  const limits = [
    25,
    50,
    100,
    200,
  ];


  const [stats, setStats] =
    useState(null);

  const [companies, setCompanies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  function updateTargeting(
    field,
    value
  ) {

    setTargeting((previous) => ({
      ...previous,
      [field]: value,
    }));

  }


  /* =================================================
     BACKEND
  ================================================= */

  useEffect(() => {

    let cancelled = false;


    async function loadTargets() {

      try {

        setLoading(true);

        setError(null);


        const data =
          await getTargetCompanies({

            job:
              form.job || "",

            sector:
              form.sector || "",

            location:
              form.location || "",

            limit:
              targeting.limit,

          });


        if (cancelled) {
          return;
        }


        console.log(
          "TARGETING DATA:",
          data
        );


        setStats(data);


        setCompanies(
          Array.isArray(
            data?.companies
          )
            ? data.companies
            : []
        );


      } catch (err) {

        if (cancelled) {
          return;
        }


        console.error(
          "Erreur ciblage:",
          err
        );


        setError(
          "Impossible d'analyser les entreprises."
        );


        setStats(null);

        setCompanies([]);


      } finally {

        if (!cancelled) {

          setLoading(false);

        }

      }

    }


    loadTargets();


    return () => {

      cancelled = true;

    };


  }, [
    form.job,
    form.sector,
    form.location,
    targeting.limit,
  ]);


  return (

    <StepAnimation>


      {/* =================================================
          HEADER
      ================================================= */}

      <StepHeading
        number="03"
        icon={
          <Target size={21} />
        }
        title="Ciblage automatique"
        description="ApplyFlow analyse votre base et sélectionne automatiquement les entreprises correspondant à votre recherche."
      />


      {/* =================================================
          CRITERIA
      ================================================= */}

      <div className="targetingCriteria">


        <div>

          <BriefcaseBusiness
            size={16}
          />

          <span>
            Poste
          </span>

          <strong>

            {form.job ||
              "Non renseigné"}

          </strong>

        </div>


        <div>

          <Sparkles
            size={16}
          />

          <span>
            Domaine
          </span>

          <strong>

            {form.sector ||
              "Tous"}

          </strong>

        </div>


        <div>

          <MapPin
            size={16}
          />

          <span>
            Localisation
          </span>

          <strong>

            {form.location ||
              "Toutes"}

          </strong>

        </div>


        <div>

          <FileText
            size={16}
          />

          <span>
            Contrat
          </span>

          <strong>

            {form.contract ||
              "Non renseigné"}

          </strong>

        </div>


      </div>


      {/* =================================================
          RESULTS
      ================================================= */}

      <div className="targetingResult">


        <div className="targetingResultHeader">


          <div>

            <span className="targetingLive">

              <i />

              {loading
                ? "ANALYSE EN COURS"
                : "BASE ANALYSÉE"}

            </span>


            <h3>

              Entreprises correspondant
              à votre profil

            </h3>


            <p>

              La sélection est générée
              automatiquement à partir
              de vos critères.

            </p>

          </div>


          <motion.div
            className="targetingMagicIcon"
            animate={
              loading
                ? {
                    rotate: [
                      0,
                      10,
                      -10,
                      0,
                    ],
                  }
                : {
                    rotate: 0,
                  }
            }
            transition={{
              repeat:
                loading
                  ? Infinity
                  : 0,

              duration: 1.5,
            }}
          >

            <WandSparkles
              size={22}
            />

          </motion.div>


        </div>


        {/* STATS */}

        <div className="targetingStats">


          <div>

            <strong>

              {loading
                ? "..."
                : (
                    stats?.found ?? 0
                  ).toLocaleString(
                    "fr-FR"
                  )}

            </strong>

            <span>
              Entreprises trouvées
            </span>

          </div>


          <div>

            <strong>

              {loading
                ? "..."
                : (
                    stats?.unique_emails ??
                    0
                  ).toLocaleString(
                    "fr-FR"
                  )}

            </strong>

            <span>
              Emails uniques
            </span>

          </div>


          <div>

            <strong>

              {loading
                ? "..."
                : (
                    stats?.duplicates_removed ??
                    0
                  ).toLocaleString(
                    "fr-FR"
                  )}

            </strong>

            <span>
              Doublons exclus
            </span>

          </div>


        </div>


        {/* ERROR */}

        {error && (

          <div className="targetingError">

            {error}

          </div>

        )}


        {/* COMPANY PREVIEW */}

        {!loading &&
          !error &&
          companies.length > 0 && (

          <div className="targetPreview">


            <div className="targetPreviewHeader">

              <div>

                <span>
                  APERÇU
                </span>

                <strong>
                  Entreprises ciblées
                </strong>

              </div>


              <small>

                {companies.length}
                {" "}
                sélectionnées

              </small>

            </div>


            <div className="targetPreviewList">


              {companies
                .slice(0, 5)
                .map(
                  (
                    company,
                    index
                  ) => (

                  <div
                    className="targetPreviewRow"
                    key={
                      company.email ||
                      index
                    }
                  >


                    <div className="targetPreviewLogo">

                      {company.entreprise
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "E"}

                    </div>


                    <div className="targetPreviewCompany">

                      <strong>

                        {company.entreprise ||
                          "Entreprise"}

                      </strong>

                      <span>

                        {company.activite ||
                          "Activité non renseignée"}

                      </span>

                    </div>


                  <div className="targetPreviewRight">

  <div className="targetScore">
    <Sparkles size={11} />

    {company.score}
    {" "}
    pts
  </div>

  <div className="targetPreviewEmail">
    <Mail size={13} />

    <span>
      {company.email}
    </span>
  </div>

</div>


                  </div>

                ))}


            </div>


          </div>

        )}


        {/* EMPTY */}

        {!loading &&
          !error &&
          companies.length === 0 && (

          <div className="targetingEmpty">

            <Search size={20} />

            <div>

              <strong>
                Aucune entreprise trouvée
              </strong>

              <span>
                Modifiez la localisation
                ou les critères de recherche.
              </span>

            </div>

          </div>

        )}


      </div>


      {/* =================================================
          LIMIT
      ================================================= */}

      <div className="targetingSection">


        <div className="targetingSectionTitle">


          <div>

            <h3>
              Nombre de candidatures
            </h3>

            <p>
              Combien d'entreprises
              souhaitez-vous préparer
              pour cette campagne ?
            </p>

          </div>


          <span className="targetingSelectedNumber">

            {targeting.limit}

          </span>


        </div>


        <div className="targetingLimits">


          {limits.map((limit) => (

            <button
              key={limit}
              type="button"
              className={
                targeting.limit ===
                limit
                  ? "targetingLimit active"
                  : "targetingLimit"
              }
              onClick={() =>
                updateTargeting(
                  "limit",
                  limit
                )
              }
            >


              <span className="targetingRadio">

                {targeting.limit ===
                  limit && (

                  <i />

                )}

              </span>


              <strong>
                {limit}
              </strong>


              <small>
                candidatures
              </small>


            </button>

          ))}


        </div>


      </div>


      {/* =================================================
          OPTIONS
      ================================================= */}

      <div className="targetingSection">


        <div className="targetingSectionTitle">

          <div>

            <h3>
              Optimisation de l'envoi
            </h3>

            <p>
              ApplyFlow nettoie automatiquement
              la liste avant le lancement.
            </p>

          </div>

        </div>


        <div className="targetingOptions">


          <TargetingOption
            icon={
              <CheckCircle2
                size={18}
              />
            }
            title="Emails valides uniquement"
            description="Ignore les lignes sans adresse email exploitable."
            checked={
              targeting.validEmailsOnly
            }
            onChange={() =>
              updateTargeting(
                "validEmailsOnly",
                !targeting.validEmailsOnly
              )
            }
          />


          <TargetingOption
            icon={
              <Building2
                size={18}
              />
            }
            title="Un seul email par entreprise"
            description="Évite plusieurs candidatures vers la même entreprise."
            checked={
              targeting.uniqueCompany
            }
            onChange={() =>
              updateTargeting(
                "uniqueCompany",
                !targeting.uniqueCompany
              )
            }
          />


          <TargetingOption
            icon={
              <Send
                size={18}
              />
            }
            title="Exclure les entreprises déjà contactées"
            description="Une entreprise déjà utilisée dans une campagne ne sera pas recontactée."
            checked={
              targeting.excludeContacted
            }
            onChange={() =>
              updateTargeting(
                "excludeContacted",
                !targeting.excludeContacted
              )
            }
          />


        </div>


      </div>


      {/* =================================================
          FINAL
      ================================================= */}

      <div className="targetingFinal">


        <div className="targetingFinalIcon">

          <Rocket
            size={20}
          />

        </div>


        <div>

          <span>
            CAMPAGNE PRÉVUE
          </span>

          <strong>

            {targeting.limit}
            {" "}
            candidatures

          </strong>

          <p>
            seront préparées automatiquement.
          </p>

        </div>


        <CheckCircle2
          size={22}
        />


      </div>


    </StepAnimation>

  );

}


/* =====================================================
   TARGETING OPTION
===================================================== */

function TargetingOption({
  icon,
  title,
  description,
  checked,
  onChange,
}) {

  return (

    <button
      type="button"
      className={
        checked
          ? "targetingOption active"
          : "targetingOption"
      }
      onClick={onChange}
    >


      <div className="targetingOptionIcon">

        {icon}

      </div>


      <div className="targetingOptionText">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>


      <div
        className={
          checked
            ? "targetingSwitch active"
            : "targetingSwitch"
        }
      >

        <motion.i
          animate={{
            x: checked
              ? 18
              : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />

      </div>


    </button>

  );

}


/* =====================================================
   STEP 4 — MESSAGE
===================================================== */

function StepMessage({
  subject,
  setSubject,
  message,
  setMessage,
}) {

  return (

    <StepAnimation>


      <StepHeading
        number="04"
        icon={
          <Mail size={21} />
        }
        title="Préparez votre message"
        description="Personnalisez le message associé à votre campagne."
      />


      <div className="messageVariables">

        <span>
          Variables disponibles
        </span>

        <button type="button">
          {"{{entreprise}}"}
        </button>

        <button type="button">
          {"{{poste}}"}
        </button>

        <button type="button">
          {"{{prenom}}"}
        </button>

      </div>


      <FormField
        label="Objet de l'email"
        full
      >

        <input
          value={subject}
          onChange={(event) =>
            setSubject(
              event.target.value
            )
          }
        />

      </FormField>


      <div className="messageEditor">


        <div className="messageEditorHeader">

          <span>
            Corps du message
          </span>

          <button type="button">

            <WandSparkles
              size={14}
            />

            Améliorer

          </button>

        </div>


        <textarea
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
        />


        <div className="messageEditorFooter">

          <span>
            {message.length}
            {" "}
            caractères
          </span>

          <span>
            CV joint automatiquement
          </span>

        </div>


      </div>


    </StepAnimation>

  );

}


/* =====================================================
   STEP 5 — VALIDATION
===================================================== */


function StepValidation({ form, cv, targeting, subject }) {
  return (
    <StepAnimation>
      <StepHeading
        number="05"
        icon={<Rocket size={21} />}
        title="Votre campagne est prête"
        description="Vérifiez les informations avant de lancer la campagne."
      />

      <div className="campaignReadyHero">
        <Rocket size={29} />
        <h3>Prêt pour le lancement</h3>
        <p>Vérifiez vos paramètres avant de continuer.</p>
      </div>

      <div className="validationGrid">
        <ValidationCard
          icon={<BriefcaseBusiness size={18} />}
          title="Recherche"
          value={form.job || "Poste non renseigné"}
          detail={`${form.contract} • ${form.sector}`}
        />

        <ValidationCard
          icon={<MapPin size={18} />}
          title="Localisation"
          value={form.location || "Non renseignée"}
          detail="Zone de recherche"
        />

        <ValidationCard
          icon={<FileText size={18} />}
          title="CV"
          value={cv?.name || "Aucun CV"}
          detail="Pièce jointe"
        />

        <ValidationCard
          icon={<Building2 size={18} />}
          title="Candidatures"
          value={`${targeting.limit} prévues`}
          detail="Ciblage automatique"
        />
      </div>

      <div className="validationEmail">
        <div>
          <Mail size={17} />
          <span>Objet</span>
        </div>
        <strong>{subject}</strong>
      </div>
    </StepAnimation>
  );
}



/* =====================================================
   SUMMARY
===================================================== */

function CampaignSummary({
  step,
  form,
  cv,
  targeting,
}) {

  return (

    <motion.aside
      className="campaignSummary"
      initial={{
        opacity: 0,
        x: 15,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: 0.2,
      }}
    >


      <div className="summaryHeader">

        <span>
          RÉSUMÉ
        </span>

        <h3>
          Votre campagne
        </h3>

      </div>


      <div className="summaryProgress">


        <div className="summaryProgressTop">

          <span>
            Progression
          </span>

          <strong>
            {step}/5
          </strong>

        </div>


        <div className="summaryProgressBar">

          <motion.div
            animate={{
              width:
                `${step * 20}%`,
            }}
          />

        </div>


      </div>


      <div className="summaryItems">


        <SummaryItem
          icon={
            <BriefcaseBusiness
              size={16}
            />
          }
          label="Poste"
          value={
            form.job ||
            "À définir"
          }
        />


        <SummaryItem
          icon={
            <Globe2 size={16} />
          }
          label="Localisation"
          value={
            form.location ||
            "À définir"
          }
        />


        <SummaryItem
          icon={
            <FileText size={16} />
          }
          label="CV"
          value={
            cv
              ? cv.name
              : "À sélectionner"
          }
        />


        <SummaryItem
          icon={
            <Target size={16} />
          }
          label="Ciblage"
          value={
            `${targeting.limit} candidatures`
          }
        />


      </div>


      <div className="summaryInfo">

        <Sparkles size={16} />

        <p>
          Vous pourrez toujours modifier
          votre campagne avant son lancement.
        </p>

      </div>


    </motion.aside>

  );

}


/* =====================================================
   HELPERS
===================================================== */

function StepAnimation({
  children,
}) {

  return (

    <motion.div
      className="campaignStepContent"
      initial={{
        opacity: 0,
        x: 18,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
        x: -15,
      }}
      transition={{
        duration: 0.28,
      }}
    >

      {children}

    </motion.div>

  );

}


function StepHeading({
  number,
  icon,
  title,
  description,
}) {

  return (

    <div className="campaignStepHeading">


      <div className="stepHeadingIcon">

        {icon}

      </div>


      <div>

        <span>
          ÉTAPE {number}
        </span>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

      </div>


    </div>

  );

}


function FormField({
  label,
  children,
  full = false,
}) {

  return (

    <label
      className={
        full
          ? "campaignField full"
          : "campaignField"
      }
    >

      <span>
        {label}
      </span>

      {children}

    </label>

  );

}


function ValidationCard({
  icon,
  title,
  value,
  detail,
}) {

  return (

    <div className="validationCard">


      <div className="validationIcon">

        {icon}

      </div>


      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {detail}
        </small>

      </div>


    </div>

  );

}


function SummaryItem({
  icon,
  label,
  value,
}) {

  return (

    <div className="summaryItem">


      <div>
        {icon}
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>


    </div>

  );

}