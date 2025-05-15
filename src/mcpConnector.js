const { Client } = require("@microsoft/microsoft-graph-client");
const { TokenCredentialAuthenticationProvider } = require("@microsoft/microsoft-graph-auth");
const { DefaultAzureCredential } = require("@azure/identity");
const kustoQueryTemplates = require('./kustoQueryTemplates');

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

  getQueryTemplate(templateName) {
    return kustoQueryTemplates[templateName] || null;
  }

  async runQuery(query, templateName = null) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    if (templateName) {
      query = this.getQueryTemplate(templateName);
      if (!query) {
        throw new Error(`Query template "${templateName}" not found.`);
      }
    }

    const result = await this.client
      .api("/kusto/query")
      .post({ query });

    return result;
  }

  async runParameterizedQuery(query, parameters) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const parameterizedQuery = this.applyParameters(query, parameters);

    const result = await this.client
      .api("/kusto/query")
      .post({ query: parameterizedQuery });

    return result;
  }

  applyParameters(query, parameters) {
    let parameterizedQuery = query;
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `@${key}`;
      parameterizedQuery = parameterizedQuery.replace(new RegExp(placeholder, 'g'), value);
    }
    return parameterizedQuery;
  }

  async getQueryExecutionPlan(query) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const result = await this.client
      .api("/kusto/query/executionPlan")
      .post({ query });

    return result;
  }

  async runQueryWithOptimizationHints(query, optimizationHints) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const queryWithHints = `${query} ${optimizationHints}`;

    const result = await this.client
      .api("/kusto/query")
      .post({ query: queryWithHints });

    return result;
  }
}

module.exports = KustoMCPConnector;
