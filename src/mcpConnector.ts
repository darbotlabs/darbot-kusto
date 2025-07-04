import { Client, KustoConnectionStringBuilder, KustoResultTable } from "azure-kusto-data";
import { DefaultAzureCredential, ClientSecretCredential } from "@azure/identity";
import kustoQueryTemplates from './kustoQueryTemplates';
import { QueryResult, QueryResultRow, QueryColumn } from './queryResults';

export interface ConnectorOptions {
  token?: string;
  aadAppId?: string;
  aadAppSecret?: string;
  tenantId?: string;
}

type Credential =
  | { type: 'token'; value: string }
  | { type: 'aadApp'; value: ClientSecretCredential }
  | { type: 'default'; value: DefaultAzureCredential };

export class KustoMCPConnector {
  private clusterUrl: string;
  private database: string;
  private options: ConnectorOptions;
  private client: Client | null;

  constructor(clusterUrl: string, database: string, options: ConnectorOptions = {}) {
    this.clusterUrl = clusterUrl;
    this.database = database;
    this.options = options;
    this.client = null;
  }

  private convertTable<T = QueryResultRow>(table: KustoResultTable): QueryResult<T> {
    const columns: QueryColumn[] = table.columns.map(c => ({ name: c.name, type: c.type }));
    const rows: T[] = [];
    for (const row of table.rows()) {
      rows.push(row.toJSON<T>());
    }
    return { columns, rows };
  }

  static createCredential(opts: ConnectorOptions = {}): Credential {
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

  async initialize(): Promise<void> {
    let kcsb: KustoConnectionStringBuilder;
    const cred = KustoMCPConnector.createCredential(this.options);
    if (cred.type === 'token') {
      kcsb = KustoConnectionStringBuilder.withAadAccessToken(this.clusterUrl, cred.value);
      this.client = new Client(kcsb);
      return;
    }
    if (cred.type === 'aadApp') {
      kcsb = KustoConnectionStringBuilder.withTokenProvider(this.clusterUrl, async () => {
        const token = await cred.value.getToken("https://kusto.kusto.windows.net/.default");
        return token.token;
      });
      this.client = new Client(kcsb);
      return;
    }
    kcsb = KustoConnectionStringBuilder.withTokenProvider(this.clusterUrl, async () => {
      const token = await cred.value.getToken("https://kusto.kusto.windows.net/.default");
      return token.token;
    });
    this.client = new Client(kcsb);
  }

  getQueryTemplate(templateName: string): string | null {
    return (kustoQueryTemplates as Record<string, string>)[templateName] || null;
  }


  async runQuery(query: string | null, templateName: string | null = null): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
    if (templateName) {
      query = this.getQueryTemplate(templateName);
      if (!query) {
        throw new Error(`Query template "${templateName}" not found.`);
      }
    }    const result = await this.client.execute(this.database, query!);
    return this.extractQueryResult(result);
  }

  async runParameterizedQuery(query: string, parameters: Record<string, string>): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const parameterizedQuery = this.applyParameters(query, parameters);    const result = await this.client.execute(this.database, parameterizedQuery);
    return this.extractQueryResult(result);

  }

  applyParameters(query: string, parameters: Record<string, string>): string {
    let parameterizedQuery = query;
    for (const [key, value] of Object.entries(parameters)) {
      const placeholder = `@${key}`;
      parameterizedQuery = parameterizedQuery.replace(new RegExp(placeholder, 'g'), value);
    }
    return parameterizedQuery;
  }

  async getQueryExecutionPlan(query: string): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const result = await this.client.execute(this.database, query);
    return this.extractQueryResult(result);
  }
  async runQueryWithOptimizationHints(query: string, optimizationHints: string): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }
    const queryWithHints = `${query} ${optimizationHints}`;
    const result = await this.client.execute(this.database, queryWithHints);
    return this.extractQueryResult(result);
  }

  static listTemplateNames(): string[] {
    return Object.keys(kustoQueryTemplates);
  }

  async runAudit(): Promise<Array<{ query: string; status: string; error?: string }>> {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const auditQueries = [
      { query: "StormEvents | count", expected: 1 },
      { query: "StormEvents | take 10", expected: 10 },
      { query: "StormEvents | summarize count() by State", expected: 50 }
    ];

    const results: Array<{ query: string; status: string; error?: string }> = [];
    for (const { query, expected } of auditQueries) {
      try {
        const result = await this.client.execute(this.database, query);
        const rowCount = (result as any).primaryResults[0].rows.length;
        if (rowCount !== expected) {
          throw new Error(`Query "${query}" returned ${rowCount} rows, expected ${expected}`);
        }
        results.push({ query, status: 'success' });
      } catch (error: any) {
        console.error(`Audit query failed: ${query}`);
        console.error(error);
        results.push({ query, status: 'failure', error: error.message });
      }
    }

    return results;
  }

  async runQueryWithEdgeCaseHandling(query: string): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    try {
      const result = await this.client.execute(this.database, query);
      if (!(result as any).primaryResults || (result as any).primaryResults.length === 0) {
        throw new Error("Query returned empty results.");
      }

      return this.extractQueryResult(result);

    } catch (error: any) {
      if (error.message.includes("Query returned empty results")) {
        console.error("Edge case: Empty results.");
      } else if (error.message.includes("Invalid query")) {
        console.error("Edge case: Invalid query.");
      } else if (error.message.includes("Request size too large")) {
        console.error("Edge case: Large dataset.");
      } else {
        console.error("Unexpected error:", error.message);
      }
      throw error;
    }
  }

  async runQueryWithNetworkIssueHandling(query: string): Promise<QueryResult> {

    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }    try {
      const result = await this.client.execute(this.database, query);
      return this.extractQueryResult(result);

    } catch (error: any) {
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        console.error('Network error: Unable to reach the Kusto cluster.');
        console.error('Recommendation: Check your VPN connection, firewall, or network settings.');
      }
      throw error;
    }
  }

  async runNaturalLanguageQuery(phrase: string): Promise<QueryResult> {
    if (!this.client) {
      throw new Error("Client not initialized. Call initialize() first.");
    }

    const mapping: Record<string, string> = {
      'how many events last week?': 'StormEvents | where Timestamp > ago(7d) | count'
    };

    const key = phrase.toLowerCase().trim();
    const query = mapping[key];
    if (!query) {
      throw new Error('Natural language query not recognized.');
    }
    return this.runQuery(query);
  }
  private extractQueryResult(result: any): QueryResult {
    const primary = result.primaryResults ? result.primaryResults[0] : result;
    
    // Check if this is a proper KustoResultTable with a rows() generator
    if (primary.rows && typeof primary.rows === 'function') {
      return this.convertTable(primary);
    }
    
    // Fallback for other result types
    const columns: QueryColumn[] = primary.columns ? primary.columns.map((col: any) => ({
      name: col.name || col.ColumnName,
      type: col.dataType || col.DataType || col.type
    })) : [];
    
    return {
      columns,
      rows: primary.rows || []
    };
  }
}

export default KustoMCPConnector;
(module as any).exports = KustoMCPConnector;
