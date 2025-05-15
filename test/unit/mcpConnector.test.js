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

    it('should use a query template if provided', async () => {
      const queryResult = { data: 'some data' };
      connector.client = {
        api: sinon.stub().returns({
          post: sinon.stub().resolves(queryResult),
        }),
      };

      const result = await connector.runQuery(null, 'template1');

      expect(result).to.equal(queryResult);
      expect(connector.client.api.calledOnceWith('/kusto/query')).to.be.true;
      expect(connector.client.api().post.calledOnceWith({ query: 'Kusto query template 1' })).to.be.true;
    });

    it('should throw an error if the query template is not found', async () => {
      try {
        await connector.runQuery(null, 'nonexistentTemplate');
      } catch (error) {
        expect(error.message).to.equal('Query template "nonexistentTemplate" not found.');
      }
    });
  });

  describe('getQueryTemplate', () => {
    it('should return the correct query template', () => {
      const template = connector.getQueryTemplate('template1');
      expect(template).to.equal('Kusto query template 1');
    });

    it('should return null if the query template is not found', () => {
      const template = connector.getQueryTemplate('nonexistentTemplate');
      expect(template).to.be.null;
    });
  });

  describe('runParameterizedQuery', () => {
    it('should throw an error if the client is not initialized', async () => {
      try {
        await connector.runParameterizedQuery('some query', {});
      } catch (error) {
        expect(error.message).to.equal('Client not initialized. Call initialize() first.');
      }
    });

    it('should run the parameterized query and return the result', async () => {
      const queryResult = { data: 'some data' };
      connector.client = {
        api: sinon.stub().returns({
          post: sinon.stub().resolves(queryResult),
        }),
      };

      const parameters = { param1: 'value1', param2: 'value2' };
      const result = await connector.runParameterizedQuery('some query with @param1 and @param2', parameters);

      expect(result).to.equal(queryResult);
      expect(connector.client.api.calledOnceWith('/kusto/query')).to.be.true;
      expect(connector.client.api().post.calledOnceWith({ query: 'some query with value1 and value2' })).to.be.true;
    });
  });

  describe('getQueryExecutionPlan', () => {
    it('should throw an error if the client is not initialized', async () => {
      try {
        await connector.getQueryExecutionPlan('some query');
      } catch (error) {
        expect(error.message).to.equal('Client not initialized. Call initialize() first.');
      }
    });

    it('should return the query execution plan', async () => {
      const executionPlan = { plan: 'some plan' };
      connector.client = {
        api: sinon.stub().returns({
          post: sinon.stub().resolves(executionPlan),
        }),
      };

      const result = await connector.getQueryExecutionPlan('some query');

      expect(result).to.equal(executionPlan);
      expect(connector.client.api.calledOnceWith('/kusto/query/executionPlan')).to.be.true;
      expect(connector.client.api().post.calledOnceWith({ query: 'some query' })).to.be.true;
    });
  });

  describe('runQueryWithOptimizationHints', () => {
    it('should throw an error if the client is not initialized', async () => {
      try {
        await connector.runQueryWithOptimizationHints('some query', 'some hints');
      } catch (error) {
        expect(error.message).to.equal('Client not initialized. Call initialize() first.');
      }
    });

    it('should run the query with optimization hints and return the result', async () => {
      const queryResult = { data: 'some data' };
      connector.client = {
        api: sinon.stub().returns({
          post: sinon.stub().resolves(queryResult),
        }),
      };

      const result = await connector.runQueryWithOptimizationHints('some query', 'some hints');

      expect(result).to.equal(queryResult);
      expect(connector.client.api.calledOnceWith('/kusto/query')).to.be.true;
      expect(connector.client.api().post.calledOnceWith({ query: 'some query some hints' })).to.be.true;
    });
  });
});
