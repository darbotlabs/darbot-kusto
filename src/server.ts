#!/usr/bin/env node
// server.ts - Specific handler for MCP server invocation
// Provides a small REPL so MCP can execute queries.
import KustoMCPConnector from './mcpConnector';
import * as readline from 'readline';

async function main(): Promise<void> {
  let cluster = process.env.KUSTO_CLUSTER;
  let database = process.env.KUSTO_DATABASE;

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--cluster' && args[i + 1]) {
      cluster = args[i + 1];
      i++;
    } else if (args[i] === '--database' && args[i + 1]) {
      database = args[i + 1];
      i++;
    }
  }

  if (!cluster || !database) {
    console.error(
      'Cluster and database must be provided via args or env (KUSTO_CLUSTER/KUSTO_DATABASE)'
    );
    process.exit(1);
  }

  const connector = new KustoMCPConnector(cluster, database);
  await connector.initialize();

  console.log('Darbot Kusto MCP server ready. Enter Kusto queries, or "exit" to quit.');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async line => {
    const query = line.trim();
    if (!query) return;
    if (query.toLowerCase() === 'exit') {
      rl.close();
      process.exit(0);
    }
    try {
      const result = await connector.runQuery(query);
      if (result && (result as any).rows && (result as any).rows.length > 0) {
        console.log(JSON.stringify((result as any).rows[0]));
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (error: any) {
      console.error('Query failed:', error.message || error);
    }
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
