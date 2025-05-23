const { expect } = require('chai');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const pkg = require('../../package.json');

const CLI = `node ${path.join(__dirname, '..', '..', 'lib', 'cli.js')}`;

describe('CLI', () => {
  it('prints version', () => {
    const out = execSync(`${CLI} --version`).toString().trim();
    expect(out).to.equal(pkg.version);
  });

  it('lists templates', () => {
    const out = execSync(`${CLI} list-templates`).toString();
    expect(out).to.contain('template1');
  });

  it('indexes a query locally', () => {
    const indexFile = path.join(__dirname, '..', '..', 'query-index', 'local', 'testQuery.kql');
    if (fs.existsSync(indexFile)) fs.unlinkSync(indexFile);
    execSync(`${CLI} index testQuery --query "print 1"`);
    expect(fs.existsSync(indexFile)).to.be.true;
    fs.unlinkSync(indexFile);
  });
});

=======
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// helper to run the CLI with optional connector mock
async function runCLI(args, mockConnector) {
  const Module = require('module');
  const cliPath = path.join(__dirname, '../../lib/cli.js');
  const originalArgv = process.argv;
  const originalLoad = Module._load;
  const originalHome = process.env.HOME;
  const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'cli-test-'));
  process.env.HOME = tempHome;
  if (mockConnector) {
    Module._load = function(request, parent, isMain) {
      if (request.includes('mcpConnector')) {
        return mockConnector;
      }
      return originalLoad.apply(this, arguments);
    };
  }
  process.argv = ['node', 'cli.js', ...args];
  delete require.cache[require.resolve(cliPath)];
  require(cliPath);
  await new Promise(resolve => setTimeout(resolve, 20));
  process.argv = originalArgv;
  process.env.HOME = originalHome;
  Module._load = originalLoad;
  fs.rmSync(tempHome, { recursive: true, force: true });
}

describe('CLI', () => {
  let logStub;
  let exitStub;

  beforeEach(() => {
    logStub = sinon.stub(console, 'log');
    sinon.stub(console, 'error');
    exitStub = sinon.stub(process, 'exit');
  });

  afterEach(() => {
    sinon.restore();
    const localDir = path.join(__dirname, '../../query-index/local');
    fs.rmSync(localDir, { recursive: true, force: true });
  });

  it('indexes a query locally', async () => {
    const filePath = path.join(__dirname, '../../query-index/local/test.kql');
    await runCLI(['index', 'test', '--query', 'print 1']);
    const contents = fs.readFileSync(filePath, 'utf-8');
    expect(contents).to.equal('print 1');
    expect(logStub.calledWithMatch('Indexed query saved to')).to.be.true;
    expect(exitStub.notCalled).to.be.true;
  });

  it('lists query templates', async () => {
    class MockConnector {
      async initialize() {}
      static listTemplateNames() { return ['a', 'b']; }
    }
    await runCLI(['list-templates', '--cluster', 'c', '--database', 'd'], MockConnector);
    expect(logStub.callCount).to.be.greaterThan(0);
  });

  it('prints version information', () => {
    const output = execSync(`node ${path.join(__dirname, '../../lib/cli.js')} --version`).toString().trim();
    const pkg = require('../../package.json');
    expect(output).to.equal(pkg.version);
  });
});

