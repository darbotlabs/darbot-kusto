
const { expect } = require('chai');
const KustoMCPConnector = require('../../src/mcpConnector');

describe('KustoMCPConnector Integration', () => {
  it('should initialize and fetch a template', async () => {
    const connector = new KustoMCPConnector('https://help.kusto.windows.net', 'Samples');
    await connector.initialize();
    const template = connector.getQueryTemplate('template1');
    expect(template).to.be.a('string');
  });
});
