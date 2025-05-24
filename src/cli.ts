import KustoMCPConnector from './mcpConnector';
import yargs from 'yargs';
import kustoQueryTemplates from './kustoQueryTemplates';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
const pkg = require('../package.json');

const INDEX_DIR = path.join(__dirname, '..', 'query-index');
const SHARED_INDEX_DIR = path.join(INDEX_DIR, 'shared');
const LOCAL_INDEX_DIR = path.join(INDEX_DIR, 'local');

const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');
const VERSION = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8')).version;

const CONFIG_PATH = path.join(
  process.env.APPDATA || path.join(process.env.HOME || '', '.config'),
  'darbot-kusto',
  'config.json'
);

function readConfig(): Record<string, any> {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function writeConfig(cfg: Record<string, any>): void {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}


const argv = yargs
  .version(pkg.version)
  .alias('version', 'v')

  .option('cluster', {
    alias: 'c',
    describe: 'Kusto cluster URL',
    type: 'string'
  })
  .option('database', {
    alias: 'd',
    describe: 'Kusto database name',
    type: 'string'
  })
  .option('token', {
    describe: 'AAD access token',
    type: 'string'
  })
  .option('aadAppId', {
    describe: 'AAD Application (client) ID',
    type: 'string'
  })
  .option('aadAppSecret', {
    describe: 'AAD Application secret',
    type: 'string'
  })
  .option('tenantId', {
    describe: 'AAD Tenant ID',
    type: 'string'
  })
  .option('template', {
    describe: 'Query template name',
    type: 'string',
    choices: Object.keys(kustoQueryTemplates)
  })
  .command('query [query]', 'Run a Kusto query', yargs => {
    return yargs.positional('query', {
      describe: 'The Kusto query to run (ignored if --template is used)',
      type: 'string'
    });
  })
  .command('audit', 'Perform an end-to-end functionality audit', () => {})
  .command('index <name> [file]', 'Index a query locally or globally', yargs => {
    return yargs
      .positional('name', { describe: 'Name for the query', type: 'string' })
      .positional('file', { describe: 'File containing the query', type: 'string' })
      .option('global', {
        alias: 'g',
        type: 'boolean',
        describe: 'Store the query in the shared index'
      })
      .option('query', { describe: 'Query string to index', type: 'string' });
  })
  .command('list-templates', 'List available query templates', () => {})
  .command('nlquery <phrase>', 'Run a natural language query', yargs => {
    return yargs.positional('phrase', { describe: 'Natural language phrase', type: 'string' });
  })
  .help().argv;

async function main(): Promise<void> {
  if ((argv as any)._.includes('list-templates')) {
    console.log('Available templates:', KustoMCPConnector.listTemplateNames().join(', '));
    return;
  }

  if ((argv as any)._.includes('index')) {
    const dir = (argv as any).global ? SHARED_INDEX_DIR : LOCAL_INDEX_DIR;
    fs.mkdirSync(dir, { recursive: true });
    let query = (argv as any).query || '';
    if ((argv as any).file) {
      query = fs.readFileSync((argv as any).file, 'utf-8');
    }
    if (!query) {
      const ans = await inquirer.prompt([{ name: 'query', type: 'editor', message: 'Enter query' }]);
      query = ans.query;
    }
    const dest = path.join(dir, `${(argv as any).name}.kql`);
    fs.writeFileSync(dest, query);
    console.log(`Indexed query saved to ${dest}`);
    return;
  }

  let { cluster, database } = argv as any;
  const saved = readConfig();
  if (!cluster) cluster = process.env.DARBOT_KUSTO_CLUSTER || saved.cluster;
  if (!database) database = process.env.DARBOT_KUSTO_DATABASE || saved.database;
  if (!cluster || !database) {
    const answers = await inquirer.prompt([
      { name: 'cluster', type: 'input', message: 'Kusto cluster URL', when: () => !cluster },
      { name: 'database', type: 'input', message: 'Kusto database name', when: () => !database }
    ]);
    cluster = cluster || answers.cluster;
    database = database || answers.database;
    writeConfig({ cluster, database });
  }

  const options = {
    token: (argv as any).token,
    aadAppId: (argv as any).aadAppId,
    aadAppSecret: (argv as any).aadAppSecret,
    tenantId: (argv as any).tenantId
  };
  const connector = new KustoMCPConnector(cluster, database, options);
  await connector.initialize();

  if ((argv as any)._.includes('query')) {
    try {
      if (!(argv as any).template && !(argv as any).query) {
        throw new Error('Query or template must be provided.');
      }
      if ((argv as any).query && !isValidQuerySyntax((argv as any).query)) {
        throw new Error('Invalid query syntax.');
      }

      let result;
      if ((argv as any).template) {
        result = await connector.runQuery(null, (argv as any).template);
      } else {
        result = await connector.runQuery((argv as any).query);
      }
      if (result && result.rows && result.rows.length > 0) {
        console.log(JSON.stringify(result.rows[0]));
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (error: any) {
      console.error('Query failed!');
      if (error.statusCode || error.code || error.message) {
        if (error.statusCode) console.error(`StatusCode: ${error.statusCode}`);
        if (error.code) console.error(`Code: ${error.code}`);
        if (error.message) console.error(`Message: ${error.message}`);
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        console.error('Network error: Unable to reach the Kusto cluster.');
        console.error('Recommendation: Check your VPN connection, firewall, or network settings.');
      }
      process.exit(1);
    }
  } else if ((argv as any)._.includes('audit')) {
    try {
      const auditResults = await connector.runAudit();
      console.log('Audit completed successfully:', auditResults);
    } catch (error: any) {
      console.error('Audit failed!');
      if (error.statusCode || error.code || error.message) {
        if (error.statusCode) console.error(`StatusCode: ${error.statusCode}`);
        if (error.code) console.error(`Code: ${error.code}`);
        if (error.message) console.error(`Message: ${error.message}`);
      }
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
        console.error('Network error: Unable to reach the Kusto cluster.');
        console.error('Recommendation: Check your VPN connection, firewall, or network settings.');
      }
      process.exit(1);
    }
  } else if ((argv as any)._.includes('nlquery')) {
    try {
      const phrase = (argv as any).phrase as string;
      const result = await connector.runNaturalLanguageQuery(phrase);
      if (result.rows.length > 0) {
        console.log(JSON.stringify(result.rows[0]));
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (error: any) {
      console.error('Natural language query failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Unknown command');
    process.exit(1);
  }
}

function isValidQuerySyntax(query: string): boolean {
  const forbiddenKeywords = ['DROP', 'DELETE', 'UPDATE'];
  for (const keyword of forbiddenKeywords) {
    if (query.toUpperCase().includes(keyword)) {
      return false;
    }
  }
  return true;
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
