import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  UploadCloud,
  X,
} from "lucide-react";

export default function Onboarding() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [contract, setContract] = useState("Stage");

  function selectFile(e) {
    const selected = e.target.files?.[0];

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      alert("Veuillez sélectionner un CV au format PDF.");
      return;
    }

    setFile(selected);
  }

  function submit(e) {
    e.preventDefault();

    if (!file) {
      alert("Veuillez ajouter votre CV.");
      return;
    }

    // Plus tard :
    // upload CV + sauvegarde critères via API

    navigate("/dashboard");
  }

  return (
    <div className="onboardingPage">
      <header className="onboardingHeader">
        <div className="brand">
          <div className="brandIcon">
            <BriefcaseBusiness size={19} />
          </div>

          ApplyFlow
        </div>

        <div className="stepText">
          Configuration du profil
        </div>
      </header>

      <main className="onboardingContainer">
        <div className="progress">
          <div className="progressActive" />
        </div>

        <div className="onboardingIntro">
          <span>ÉTAPE 1 SUR 3</span>

          <h1>Préparons votre recherche.</h1>

          <p>
            Ajoutez votre CV et indiquez-nous le type
            d'opportunité que vous recherchez.
          </p>
        </div>

        <form onSubmit={submit}>
          <section className="onboardingCard">
            <div className="cardTitle">
              <div className="number">1</div>

              <div>
                <h3>Votre CV</h3>
                <p>PDF • Maximum 10 MB</p>
              </div>
            </div>

            {!file ? (
              <div
                className="uploadZone"
                onClick={() => inputRef.current?.click()}
              >
                <div className="uploadIcon">
                  <UploadCloud size={27} />
                </div>

                <strong>Déposez votre CV ici</strong>

                <span>
                  ou cliquez pour sélectionner un fichier
                </span>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={selectFile}
                  hidden
                />
              </div>
            ) : (
              <div className="uploadedFile">
                <div className="pdfIcon">
                  <FileText size={23} />
                </div>

                <div className="fileInfo">
                  <strong>{file.name}</strong>

                  <span>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>

                <div className="fileSuccess">
                  <Check size={17} />
                </div>

                <button
                  type="button"
                  className="removeFile"
                  onClick={() => setFile(null)}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </section>

          <section className="onboardingCard">
            <div className="cardTitle">
              <div className="number">2</div>

              <div>
                <h3>Votre recherche</h3>
                <p>
                  Ces informations permettront de cibler
                  les opportunités pertinentes.
                </p>
              </div>
            </div>

            <div className="field">
              <label>Poste recherché</label>

              <input
                type="text"
                placeholder="Ex : Data Analyst"
                required
              />
            </div>

            <div className="field">
              <label>Type de contrat</label>

              <div className="contractButtons">
                {["Stage", "Alternance", "CDI", "CDD"].map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        contract === item
                          ? "contract active"
                          : "contract"
                      }
                      onClick={() => setContract(item)}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="field">
              <label>Localisation</label>

              <input
                type="text"
                placeholder="Ex : Paris, France"
                required
              />
            </div>
          </section>

          <button className="continueButton">
            Continuer
            <ArrowRight size={19} />
          </button>
        </form>
      </main>
    </div>
  );
}