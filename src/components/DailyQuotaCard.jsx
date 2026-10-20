
import { useEffect, useState } from "react";
import { Crown, Mail } from "lucide-react";
import { getMyQuota } from "../services/api";

export default function DailyQuotaCard() {
  const [quota, setQuota] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadQuota() {
      try {
        const data = await getMyQuota();
        if (active) {
          setQuota(data);
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadQuota();
    const interval = setInterval(loadQuota, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  if (error && !quota) {
    return <p className="quotaError">{error}</p>;
  }

  if (!quota) return null;

  const used = quota.sent + quota.reserved;
  const percent = quota.limit
    ? Math.min(100, (used / quota.limit) * 100)
    : 0;

  return (
    <section className="dailyQuotaCard">
      <div className="quotaHeader">
        <div>
          <span className="quotaEyebrow">
            APPLYFLOW · QUOTA QUOTIDIEN
          </span>
          <h3>Vos candidatures</h3>
        </div>

        <span className="quotaPlan">
          {quota.plan.toUpperCase()}
        </span>
      </div>

      <div className="quotaNumbers">
        <Mail size={21} />
        <strong>{used}</strong>
        <span>/ {quota.limit}</span>
      </div>

      <div className="quotaTrack">
        <div style={{ width: `${percent}%` }} />
      </div>

      <p className="quotaRemaining">
        {quota.remaining} envois disponibles aujourd'hui
      </p>

      {quota.plan === "free" && (
        <button
          className="quotaUpgrade"
          type="button"
          disabled
          title="Abonnements bientôt disponibles"
        >
          <Crown size={17} />
          Passer à PRO
        </button>
      )}
    </section>
  );
}
