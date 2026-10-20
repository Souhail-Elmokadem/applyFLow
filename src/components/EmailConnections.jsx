
import { useEffect, useState } from "react";
import {
  getEmailAccounts,
  connectGmail,
  disconnectEmailAccount,
} from "../services/api";

export default function EmailConnections() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function loadAccounts() {
    try {
      setError("");
      const data = await getEmailAccounts();
      setAccounts(data.accounts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleConnect() {
    try {
      setConnecting(true);
      setError("");
      await connectGmail();
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  }

  async function handleDisconnect(id) {
    if (!window.confirm("Déconnecter ce compte email ?")) {
      return;
    }

    try {
      setError("");
      await disconnectEmailAccount(id);
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    }
  }

  const gmailAccounts = accounts.filter(
    (account) => account.provider === "gmail"
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Comptes email
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Connectez vos adresses pour envoyer vos candidatures.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              Gmail / Google Workspace
            </h3>
            <p className="text-sm text-slate-500">
              Connectez votre compte Google en toute sécurité.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {connecting ? "Connexion..." : "Connecter Gmail"}
          </button>
        </div>

        {loading ? (
          <p className="mt-5 text-sm text-slate-500">
            Chargement des comptes...
          </p>
        ) : gmailAccounts.length > 0 ? (
          <div className="mt-5 space-y-3">
            {gmailAccounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {account.email_address}
                  </p>
                  <p className="text-xs text-emerald-600">
                    Compte connecté
                  </p>
                </div>

                <button
                  onClick={() => handleDisconnect(account.id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Déconnecter
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-500">
            Aucun compte Gmail connecté.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-900">
          Outlook / Microsoft 365
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          La connexion Outlook sera disponible prochainement.
        </p>

        <button
          disabled
          className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-400"
        >
          Connecter Outlook — Bientôt
        </button>
      </div>
    </section>
  );
}
