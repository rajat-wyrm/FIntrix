const axios = require("axios");

const SALESFORCE_TOKEN = process.env.SALESFORCE_ACCESS_TOKEN;
const SALESFORCE_INSTANCE_URL = process.env.SALESFORCE_INSTANCE_URL;

const salesforceClient = axios.create({
  baseURL: SALESFORCE_INSTANCE_URL,
  headers: {
    Authorization: `Bearer ${SALESFORCE_TOKEN}`,
    "Content-Type": "application/json",
  },
});

const fetchSalesforceLeads = async () => {
  try {
    let results = [];

    const query =
      "SELECT Id, FirstName, LastName, Email, Phone FROM Lead LIMIT 200";

    let { data } = await salesforceClient.get(
      "/services/data/v59.0/query",
      { params: { q: query } }
    );
    results = [...results, ...(data.records || [])];

    let nextUrl = data.nextRecordsUrl;

    while (nextUrl) {
      const nextRes = await salesforceClient.get(nextUrl);
      results = [...results, ...(nextRes.data.records || [])];
      nextUrl = nextRes.data.nextRecordsUrl;
    }

    return results;
  } catch (error) {
    console.error("Salesforce fetch error:", error.message);
    throw new Error("Failed to fetch Salesforce leads");
  }
};



const pushSalesforceLead = async (lead) => {
  try {
    const payload = {
      FirstName: lead.firstName,
      LastName: lead.lastName,
      Email: lead.email,
      Phone: lead.phone,
      Company: lead.company || "Unknown",
    };

    const { data } = await salesforceClient.post(
      "/services/data/v59.0/sobjects/Lead",
      payload
    );

    return data;

  } catch (error) {
    console.error("Salesforce push error:", error.message);
    throw new Error("Failed to push lead to Salesforce");
  }
};

module.exports = {
  fetchSalesforceLeads,
  pushSalesforceLead,
};
