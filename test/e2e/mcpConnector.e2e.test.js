const { expect } = require('chai');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Skip end-to-end tests in CI or offline environments
const describeOrSkip = process.env.CI ? describe.skip : describe;

describeOrSkip('KustoMCPConnector Smoke Test', () => {
  it('should run a Kusto query using the local CLI', function(done) {
    this.timeout(10000);
    exec('node lib/cli.js --cluster https://help.kusto.windows.net --database Samples query "print 1"', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return done(error);
      }
      expect(stdout).to.contain('print_0');
      done();
    });
  });

  it('should perform an end-to-end functionality audit using the local CLI', function(done) {
    this.timeout(20000);
    exec('node lib/cli.js --cluster https://help.kusto.windows.net --database Samples audit', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return done(error);
      }
      expect(stdout).to.contain('Audit completed successfully');
      done();
    });
  });
});
