const { expect } = require('chai');
const sinon = require('sinon');
const KustoMCPConnector = require('../../src/mcpConnector');
const { Client } = require('@microsoft/microsoft-graph-client');
const { TokenCredentialAuthenticationProvider } = require('@microsoft/microsoft-graph-auth');
const { DefaultAzureCredential } = require('@azure/identity');

describe('KustoMCPConnector', () => {
  let connector;
  let clientStub;
  let authProviderStub;
  let credentialStub;

  beforeEach(() => {
    connector = new KustoMCPConnector();
    clientStub = sinon.stub(Client, 'initWithMiddleware');
    authProviderStub = sinon.stub(TokenCredentialAuthenticationProvider.prototype, 'constructor');
    credentialStub = sinon.stub(DefaultAzureCredential.prototype, 'constructor');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('initialize', () => {
    it('should initialize the client with the correct auth provider', async () => {
      const authProvider = {};
      authProviderStub.returns(authProvider);
      clientStub.returns({});

      await connector.initialize();

      expect(authProviderStub.calledOnce).to.be.true;
      expect(clientStub.calledOnceWith({ authProvider })).to.be.true;
    });
  });

  describe('runQuery', () => {
    it('should throw an error if the client is not initialized', async () => {
      try {
        await connector.runQuery('some query');
      } catch (error) {
        expect(error.message).to.equal('Client not initialized. Call initialize() first.');
      }
    });

    it('should run the query and return the result', async () => {
      const queryResult = { data: 'some data' };
      connector.client = {
        api: sinon.stub().returns({
          post: sinon.stub().resolves(queryResult),
        }),
      };

      const result = await connector.runQuery('some query');

      expect(result).to.equal(queryResult);
      expect(connector.client.api.calledOnceWith('/kusto/query')).to.be.true;
      expect(connector.client.api().post.calledOnceWith({ query: 'some query' })).to.be.true;
    });
  });
});
