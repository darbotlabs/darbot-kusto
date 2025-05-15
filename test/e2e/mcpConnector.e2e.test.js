const { expect } = require('chai');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

describe('KustoMCPConnector End-to-End Tests', () => {
  const projectDir = path.resolve(__dirname, '../../');
  const vscodeConfigPath = path.join(projectDir, '.vscode/settings.json');

  before((done) => {
    // Run the PowerShell script to install dependencies and configure VSCode
    exec('npm run install-dependencies', { cwd: projectDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return done(error);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      done();
    });
  });

  it('should configure VSCode with the MCP connector', (done) => {
    fs.readFile(vscodeConfigPath, 'utf8', (err, data) => {
      if (err) {
        return done(err);
      }

      const config = JSON.parse(data);
      expect(config['mcp.connector']).to.exist;
      expect(config['mcp.connector'].name).to.equal('darbot-kusto');
      expect(config['mcp.connector'].type).to.equal('kusto');
      expect(config['mcp.connector'].command).to.equal('node src/kustoConnector.js');
      done();
    });
  });

  it('should run a Kusto query from the command line', (done) => {
    exec('node src/cli.js query "some query"', { cwd: projectDir }, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return done(error);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
      expect(stdout).to.contain('some data');
      done();
    });
  });

  it('should run a Kusto query from VSCode', async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('vscode://file/' + projectDir);

    // Open the command palette and run the Kusto query command
    await page.keyboard.press('Control+Shift+P');
    await page.keyboard.type('MCP: Run Kusto Query');
    await page.keyboard.press('Enter');
    await page.keyboard.type('some query');
    await page.keyboard.press('Enter');

    // Wait for the results to be displayed in the output pane
    await page.waitForSelector('.output-pane');
    const result = await page.$eval('.output-pane', (el) => el.textContent);

    expect(result).to.contain('some data');

    await browser.close();
  });
});
