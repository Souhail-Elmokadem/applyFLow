
const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";



function authHeaders(extraHeaders = {}) {
  const token = sessionStorage.getItem("applyflow_token");

  if (!token) {
    throw new Error("Veuillez vous connecter.");
  }

  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}

/* =====================================================
   COMPANY STATS
===================================================== */

export async function getCompanyStats() {
  const response = await fetch(
    `${API_URL}/api/companies/stats`
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Erreur API ${response.status}: ${error}`
    );
  }

  return response.json();
}


/* =====================================================
   TARGET COMPANIES
===================================================== */

export async function getTargetCompanies(criteria) {
  const response = await fetch(
    `${API_URL}/api/companies/target`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        job: criteria.job || "",
        sector: criteria.sector || "",
        location: criteria.location || "",
        limit: criteria.limit || 100,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      `Erreur API ${response.status}: ${error}`
    );
  }

  return response.json();
}





export async function createCampaign(data) {
  const response = await fetch(
    `${API_URL}/api/campaigns`,
    {
      method: "POST",
        headers: authHeaders(),

      headers: authHeaders({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();

    console.error("CREATE CAMPAIGN ERROR:", error);

    throw new Error(JSON.stringify(error));
  }

  return response.json();
}



export async function getApplications() {
  const token = sessionStorage.getItem("applyflow_token");

  if (!token) {
    throw new Error("Utilisateur non connecté.");
  }

  const response = await fetch(
    `${API_URL}/api/applications`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Session expirée. Reconnectez-vous.");
    }

    const error = await response.text();

    throw new Error(
      `Erreur récupération candidatures ${response.status}: ${error}`
    );
  }

  return response.json();
}




export async function uploadCampaignCV(
  campaignId,

  file
) {
  const formData =
    new FormData();

  formData.append(
    "cv",
    file
  );

  const response = await fetch(
    `${API_URL}/api/campaigns/${campaignId}/cv`,
    {
      method: "POST",
        headers: authHeaders(),
      body: formData,
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    console.error(
      "UPLOAD CV ERROR:",
      error
    );

    throw new Error(
      error?.detail ||
      "Impossible d'envoyer le CV."
    );
  }

  return response.json();
}




export async function launchCampaign(campaignId, emailAccountId) {
  const token = sessionStorage.getItem("applyflow_token");

  if (!token) {
    throw new Error("Vous devez vous connecter.");
  }

  if (!emailAccountId) {
    throw new Error("Sélectionnez un compte Gmail.");
  }

  const response = await fetch(
    `${API_URL}/api/campaigns/${campaignId}/launch`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email_account_id: Number(emailAccountId),
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Impossible de lancer la campagne."
    );
  }

  return data;
}




export async function getCampaignProgress(campaignId) {
  const response = await fetch(
    `${API_URL}/api/campaigns/${campaignId}/progress`,
    {
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Impossible de récupérer la progression."
    );
  }

  return data;
}



export async function getEmailAccounts() {
  const token = sessionStorage.getItem("applyflow_token");

  const response = await fetch(
    `${API_URL}/api/email-accounts`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de récupérer les comptes email"
    );
  }

  return response.json();
}


export async function connectGmail() {
  const token = sessionStorage.getItem("applyflow_token");

  const response = await fetch(
    `${API_URL}/api/oauth/google/connect`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Impossible de démarrer la connexion Gmail"
    );
  }

  const data = await response.json();

  if (!data.authorization_url) {
    throw new Error("URL Google OAuth manquante");
  }

  window.location.assign(data.authorization_url);
}


export async function disconnectEmailAccount(accountId) {
  const token = sessionStorage.getItem("applyflow_token");

  const response = await fetch(
    `${API_URL}/api/email-accounts/${accountId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Impossible de déconnecter ce compte");
  }

  return response.json();
}

export async function pauseCampaign(campaignId) {
  const response = await fetch(
    `${API_URL}/api/campaigns/${campaignId}/pause`,
    {
      method: "POST",
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Impossible de mettre en pause.");
  }

  return data;
}

export async function resumeCampaign(campaignId, emailAccountId) {
  return launchCampaign(campaignId, emailAccountId);
}

export async function getMyQuota() {
  const response = await fetch(
    `${API_URL}/api/campaigns/quota/me`,
    {
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Impossible de récupérer votre quota."
    );
  }

  return data;
}