


const KustoMCPConnector = require('./mcpConnector');
const yargs = require('yargs');
const kustoQueryTemplates = require('./kustoQueryTemplates');

const argv = yargs
  .option('cluster', {
    alias: 'c',
    describe: 'Kusto cluster URL',
    type: 'string',
    demandOption: true
  })
  .option('database', {
    alias: 'd',
    describe: 'Kusto database name',
    type: 'string',
    demandOption: true
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
  .command('query [query]', 'Run a Kusto query', (yargs) => {
    yargs.positional('query', {
      describe: 'The Kusto query to run (ignored if --template is used)',
      type: 'string'
    });
  })
  .help()
  .argv;


async function main() {
  const options = {
    token: argv.token,
    aadAppId: argv.aadAppId,
    aadAppSecret: argv.aadAppSecret,
    tenantId: argv.tenantId
  };
  const connector = new KustoMCPConnector(argv.cluster, argv.database, options);
  await connector.initialize();

  if (argv._.includes('query')) {
    try {
      let result;
      if (argv.template) {
        result = await connector.runQuery(null, argv.template);
      } else {
        result = await connector.runQuery(argv.query);
      }
      // Print only the first row if result is a table
      if (result && result.rows && result.rows.length > 0) {
        console.log(JSON.stringify(result.rows[0]));
      } else {
        console.log(JSON.stringify(result));
      }
    } catch (error) {
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
  } else if (argv._.includes('list-templates')) {
    console.log('Available templates:', KustoMCPConnector.listTemplateNames().join(', '));
  } else {
    console.log('Unknown command');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
