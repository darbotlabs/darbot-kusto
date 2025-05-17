const { expect } = require('chai');
const KustoMCPConnector = require('../../src/mcpConnector');

// Skip expensive integration tests when running in CI or offline
const describeOrSkip = process.env.CI ? describe.skip : describe;

describeOrSkip('KustoMCPConnector Integration', () => {
  it('should initialize and fetch a template', async () => {
    const connector = new KustoMCPConnector('https://help.kusto.windows.net', 'Samples');
    await connector.initialize();
    const template = connector.getQueryTemplate('template1');
    expect(template).to.be.a('string');
  });

  it('should run audit and validate results', async () => {
    const connector = new KustoMCPConnector('https://help.kusto.windows.net', 'Samples');
    await connector.initialize();
    const auditResults = await connector.runAudit();
    expect(auditResults).to.be.an('array');
    auditResults.forEach(result => {
      expect(result).to.have.property('query');
      expect(result).to.have.property('status');
      if (result.status === 'failure') {
        expect(result).to.have.property('error');
      }
    });
  });
});
