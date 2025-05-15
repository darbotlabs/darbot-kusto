# darbot-kusto-mcp

An MCP connector for running Kusto queries from VSCode.

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

## License

This project is licensed under the MIT License.
