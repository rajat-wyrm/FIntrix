import { useState } from "react";

export default function useChatAgent(searchData, conversionData, sourceData) {
  const [loading, setLoading] = useState(false);

  const askAgent = async (query) => {
    setLoading(true);

    let response = { role: "bot", type: "text", content: "Sorry, I didn’t understand." };

    if (query.toLowerCase().includes("weekly activity")) {
      response = { role: "bot", type: "chart", chart: "bar", data: searchData };
    } else if (query.toLowerCase().includes("conversion trend")) {
      response = { role: "bot", type: "chart", chart: "line", data: conversionData };
    } else if (query.toLowerCase().includes("lead sources")) {
      response = { role: "bot", type: "chart", chart: "pie", data: sourceData };
    }

    setLoading(false);
    return response;
  };

  return { askAgent, loading };
}
