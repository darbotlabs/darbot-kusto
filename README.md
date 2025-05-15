# darbot-kusto

A connector for running Kusto queries from VSCode.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/darbotlabs/darbot-kusto.git
   cd darbot-kusto
   ```

2. Install dependencies and configure VSCode:
   ```sh
   npm run install-dependencies
   ```

## Usage

### Using the MCP Connector in VSCode

1. Open VSCode in the project directory:
   ```sh
   code .
   ```

2. Open the command palette (Ctrl+Shift+P) and search for "MCP: Run Kusto Query".

3. Enter your Kusto query and press Enter. The results will be displayed in the output pane.

### Using the Standalone CLI Tool

1. Run a Kusto query from the command line:
   ```sh
   node src/cli.js query "<Your Kusto Query>"
   ```

   Replace `<Your Kusto Query>` with your actual Kusto query.

### Using Query Templates

1. You can use predefined query templates by specifying the template name instead of writing the full query.

2. To use a query template in VSCode, open the command palette (Ctrl+Shift+P) and search for "MCP: Run Kusto Query". Enter the template name and press Enter. The results will be displayed in the output pane.

3. To use a query template from the command line, run:
   ```sh
   node src/cli.js query --template <TemplateName>
   ```

   Replace `<TemplateName>` with the name of the query template you want to use.

### Using the Visual Query Builder in VSCode

1. Open VSCode in the project directory:
   ```sh
   code .
   ```

2. Open the command palette (Ctrl+Shift+P) and search for "MCP: Open Visual Query Builder".

3. Use the drag-and-drop interface to create your query. The query will be displayed in the query editor.

4. Click the "Run Query" button to execute the query. The results will be displayed in the output pane.

### Using Advanced Query Features

1. You can use advanced query features such as parameterized queries, query execution plans, and query optimization hints.

2. To run a parameterized query, use the `runParameterizedQuery` method in the MCP connector:
   ```js
   const connector = new KustoMCPConnector();
   await connector.initialize();
   const parameters = { param1: 'value1', param2: 'value2' };
   const result = await connector.runParameterizedQuery('Your Kusto Query with @param1 and @param2', parameters);
   console.log(result);
   ```

3. To get a query execution plan, use the `getQueryExecutionPlan` method in the MCP connector:
   ```js
   const connector = new KustoMCPConnector();
   await connector.initialize();
   const executionPlan = await connector.getQueryExecutionPlan('Your Kusto Query');
   console.log(executionPlan);
   ```

4. To run a query with optimization hints, use the `runQueryWithOptimizationHints` method in the MCP connector:
   ```js
   const connector = new KustoMCPConnector();
   await connector.initialize();
   const optimizationHints = 'Your optimization hints';
   const result = await connector.runQueryWithOptimizationHints('Your Kusto Query', optimizationHints);
   console.log(result);
   ```

## License

This project is licensed under the MIT License.
