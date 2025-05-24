const { expect } = require('chai');
const { execSync } = require('child_process');
const pkg = require('../../package.json');

describe('CLI --version', () => {
  it('prints the package version', () => {
    const output = execSync('node lib/cli.js --version').toString().trim();
    expect(output).to.equal(pkg.version);
  });
});
