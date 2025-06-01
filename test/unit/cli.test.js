const { expect } = require('chai');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const pkg = require('../../package.json');

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
    if (fs.existsSync(localDir)) {
      fs.rmSync(localDir, { recursive: true, force: true });
    }
  });

  it('prints version', () => {
    const output = execSync(`node ${path.join(__dirname, '../../lib/cli.js')} --version`).toString().trim();
    expect(output).to.equal(pkg.version);
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
      static listTemplateNames() { return ['template1', 'template2']; }
    }
    await runCLI(['list-templates', '--cluster', 'c', '--database', 'd'], MockConnector);
    expect(logStub.callCount).to.be.greaterThan(0);
  });
});

