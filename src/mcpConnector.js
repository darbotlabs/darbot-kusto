const { Client, KustoConnectionStringBuilder } = require("azure-kusto-data");
const { DefaultAzureCredential, ClientSecretCredential } = require("@azure/identity");
const kustoQueryTemplates = require('./kustoQueryTemplates');

class KustoMCPConnector {
  /**
   * @param {string} clusterUrl - The Kusto cluster URL
   * @param {string} database - The Kusto database name
   * @param {object} [options] - Optional. { token: string, aadAppId: string, aadAppSecret: string, tenantId: string }
   */
  constructor(clusterUrl, database, options = {}) {
    this.clusterUrl = clusterUrl;
    this.database = database;
    this.options = options;
    this.client = null;
  }


  static createCredential(opts = {}) {
    // Priority: Token > AAD App > DefaultAzureCredential
    if (opts.token) {
      return { type: 'token', value: opts.token };
    }
    if (opts.aadAppId && opts.aadAppSecret && opts.tenantId) {
      return {
        type: 'aadApp',
        value: new ClientSecretCredential(opts.tenantId, opts.aadAppId, opts.aadAppSecret)
      };
    }
    return { type: 'default', value: new DefaultAzureCredential() };
  }

  async initialize() {
    let kcsb;
    const cred = KustoMCPConnector.createCredential(this.options);
    if (cred.type === 'token') {
      kcsb = KustoConnectionStringBuilder.withAadAccessToken(this.clusterUrl, cred.value);
      this.client = new Client(kcsb);
      return;
    }
    if (cred.type === 'aadApp') {
      // Use token provider for AAD App
      kcsb = KustoConnectionStringBuilder.withTokenProvider(this.clusterUrl, async () => {
        const token = await cred.value.getToken("https://kusto.kusto.windows.net/.default");
        return token.token;
      });
      this.client = new Client(kcsb);
      return;
    }
    // DefaultAzureCredential
    kcsb = KustoConnectionStringBuilder.withTokenProvider(this.clusterUrl, async () => {
      const token = await cred.value.getToken("https://kusto.kusto.windows.net/.default");
      return token.token;
    });
    this.client = new Client(kcsb);
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
        throw new Error(`Query template \"${templateName}\" not found.`);
      }
    }
    const result = await this.client.execute(this.database, query);
    return result.primaryResults ? result.primaryResults[0] : result;
  }

  async runParameterizedQuery(query, parameters) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const parameterizedQuery = this.applyParameters(query, parameters);

    const result = await this.client.execute(this.database, parameterizedQuery);
    return result.primaryResults ? result.primaryResults[0] : result;
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

    // Kusto SDK does not have a direct method for execution plan, but you can use .executeQueryV1 with a special command if needed
    // For now, just run the query
    const result = await this.client.execute(this.database, query);
    return result.primaryResults ? result.primaryResults[0] : result;
  }

  async runQueryWithOptimizationHints(query, optimizationHints) {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
    const queryWithHints = `${query} ${optimizationHints}`;
    const result = await this.client.execute(this.database, queryWithHints);
    return result.primaryResults ? result.primaryResults[0] : result;
  }

  static listTemplateNames() {
    return Object.keys(kustoQueryTemplates);
  }
}

module.exports = KustoMCPConnector;
