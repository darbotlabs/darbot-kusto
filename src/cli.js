const KustoMCPConnector = require('./mcpConnector');
const yargs = require('yargs');

const argv = yargs
  .command('query <query>', 'Run a Kusto query', (yargs) => {
    yargs.positional('query', {
      describe: 'The Kusto query to run',
      type: 'string'
    });
  })
  .help()
  .argv;

async function main() {
  const connector = new KustoMCPConnector();
  await connector.initialize();

  if (argv._.includes('query')) {
    const result = await connector.runQuery(argv.query);
    console.log(result);
  } else {
    console.log('Unknown command');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
