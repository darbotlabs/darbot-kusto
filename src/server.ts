#!/usr/bin/env node
// server.ts - Specific handler for MCP server invocation
// This ensures no prompts during VS Code MCP server installation
import KustoMCPConnector from './mcpConnector';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import readline from 'readline';

console.log('Darbot Kusto MCP server initializing...');

const argv = yargs(hideBin(process.argv))
  .option('cluster', { alias: 'c', type: 'string' })
  .option('database', { alias: 'd', type: 'string' })
  .help().parseSync();

async function start() {
  const cluster = argv.cluster || process.env.DARBOT_KUSTO_CLUSTER;
  const database = argv.database || process.env.DARBOT_KUSTO_DATABASE;
  if (!cluster || !database) {
    console.error('Cluster and database must be provided via arguments or environment variables.');
    process.exit(1);
  }
  const connector = new KustoMCPConnector(cluster, database);
  await connector.initialize();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'kusto> ' });
  rl.prompt();
  rl.on('line', async line => {
    const trimmed = line.trim();
    if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
      rl.close();
      return;
    }
    if (!trimmed) { rl.prompt(); return; }
    try {
      const result = await connector.runQuery(trimmed);
      console.log(JSON.stringify(result.rows[0] || result.rows));
    } catch (err: any) {
      console.error('Query failed:', err.message);
    }
    rl.prompt();
  });
}

start().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
