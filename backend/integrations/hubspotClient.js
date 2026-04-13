const axios = require("axios");

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_BASE_URL = "https://api.hubapi.com";

const hubspotClient = axios.create({
  baseURL: HUBSPOT_BASE_URL,
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const fetchHubSpotLeads = async () => {
  try {
    let results = [];
    let after = undefined;

    do {
      const { data } = await hubspotClient.get(
        "/crm/v3/objects/contacts",
        {
          params: {
            limit: 100,
            after,
            properties: "firstname,lastname,email,phone",
          },
        }
      );

      results = [...results, ...(data.results || [])];

      after = data.paging?.next?.after;
    } while (after);

    return results;

  } catch (error) {
    console.error("HubSpot fetch error:", error.message);
    throw new Error("Failed to fetch HubSpot leads");
  }
};

const pushHubSpotLead = async (lead) => {
  try {
    const payload = {
      properties: {
        firstname: lead.firstName,
        lastname: lead.lastName,
        email: lead.email,
        phone: lead.phone,
      },
    };

    const { data } = await hubspotClient.post(
      "/crm/v3/objects/contacts",
      payload
    );

    return data;

  } catch (error) {
    console.error("HubSpot push error:", error.message);
    throw new Error("Failed to push lead to HubSpot");
  }
};

module.exports = {
  fetchHubSpotLeads,
  pushHubSpotLead,
};
