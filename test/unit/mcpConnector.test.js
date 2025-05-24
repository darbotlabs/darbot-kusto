const { expect } = require('chai');
const sinon = require('sinon');
const KustoMCPConnector = require('../../lib/mcpConnector');

describe('KustoMCPConnector', () => {
  describe('createCredential', () => {
    it('should return token credential when token is provided', () => {
      const cred = KustoMCPConnector.createCredential({ token: 'abc' });
      expect(cred.type).to.equal('token');
      expect(cred.value).to.equal('abc');
    });
    it('should return aadApp credential when aadAppId, aadAppSecret, and tenantId are provided', () => {
      const cred = KustoMCPConnector.createCredential({ aadAppId: 'id', aadAppSecret: 'secret', tenantId: 'tid' });
      expect(cred.type).to.equal('aadApp');
      expect(cred.value).to.exist;
    });
    it('should return default credential when nothing is provided', () => {
      const cred = KustoMCPConnector.createCredential({});
      expect(cred.type).to.equal('default');
      expect(cred.value).to.exist;
    });
  });

  describe('listTemplateNames', () => {
    it('should list all template names', () => {
      const names = KustoMCPConnector.listTemplateNames();
      expect(names).to.include('template1');
      expect(names).to.include('template2');
      expect(names).to.include('template3');
    });
  });

  describe('runQuery', () => {
    it('should return typed query results', async () => {
      const connector = new KustoMCPConnector('cluster', 'db');
      connector.client = { execute: sinon.stub().resolves({
        primaryResults: [{
          columns: [{ name: 'c', type: 'int' }],
          rows: function* () { yield { toJSON: () => ({ c: 1 }) }; }
        }]
      }) };

      const result = await connector.runQuery('test');
      expect(result.columns[0].name).to.equal('c');
      expect(result.rows[0]).to.deep.equal({ c: 1 });
    });
  });
});
