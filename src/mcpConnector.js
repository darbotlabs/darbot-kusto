const { Client } = require("@microsoft/microsoft-graph-client");
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-auth");
const { DefaultAzureCredential } = require("@azure/identity");

class KustoMCPConnector {
  constructor() {
    this.client = null;
  }

  async initialize() {
    const credential = new DefaultAzureCredential();
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ["https://graph.microsoft.com/.default"],
    });

    this.client = Client.initWithMiddleware({ authProvider });
  }

  async runQuery(query) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const result = await this.client
      .api("/kusto/query")
      .post({ query });

    return result;
  }
}

module.exports = KustoMCPConnector;
