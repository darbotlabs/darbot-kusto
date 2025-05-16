const { expect } = require('chai');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('KustoMCPConnector Smoke Test', () => {
  it('should run a Kusto query using the local CLI', function(done) {
    this.timeout(10000);
    exec('node src/cli.js --cluster https://help.kusto.windows.net --database Samples query "print 1"', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return done(error);
      }
      expect(stdout).to.contain('print_0');
      done();
    });
  });
});
