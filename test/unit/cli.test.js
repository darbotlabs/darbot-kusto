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

