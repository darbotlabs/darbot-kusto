<p align="center">
  <img src="logo.png" alt="darbot-kusto logo" width="120"/>
</p>

# Darbot Kusto MCP

A connector for running Kusto queries from VSCode.
Darbot Labs: <https://github.com/darbotlabs/darbot-kusto>

## Quick Start

Add this to your MCP config (VS Code, Claude Desktop, etc):

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto/src/server.js"
  ]
}
```

You can now start the server from the MCP UI and run Kusto queries securely using your Windows/Entra/az login credentials by default.
Cluster and database information will be requested when you run your first query, so they are not required in the MCP configuration.
For more detailed installation, usage, and advanced features, please see the [documentation in the docs folder](./docs/).
See [Common Commands](#common-commands) below for how to index queries and view template names.

## Authentication

By default, authentication uses your Windows/Entra/az login credentials (via DefaultAzureCredential).
You can also provide a token or AAD app credentials. See [docs/troubleshooting.md](./docs/troubleshooting.md) for more details.

## Security Best Practices

Store credentials such as `AAD_APP_SECRET` or access tokens in environment variables or a secure vault. Avoid committing secrets to source control. Input provided to the CLI is executed as Kusto queries, so ensure you trust the source or review it carefully.

## CLI Usage

```sh
npx @darbotlabs/darbot-kusto --cluster <ClusterUrl> --database <Database> query "<Your Kusto Query>"
```

Use `--version` (or `-v`) to print the current package version. The CLI also respects the
`DARBOT_KUSTO_CLUSTER` and `DARBOT_KUSTO_DATABASE` environment variables so it can run headless in CI.

### Indexing and Templates

Save queries for later execution with the `index` command:

```sh
npx @darbotlabs/darbot-kusto index myQuery --query "StormEvents | take 5"
```

This stores `myQuery.kql` under `query-index/local`. Use `--global` to save to `query-index/shared` for team sharing.
List available templates with:

```sh
npx @darbotlabs/darbot-kusto list-templates
```

For more options, run:

```sh
npx @darbotlabs/darbot-kusto --help
```

To check your installed version:

```sh
npx @darbotlabs/darbot-kusto --version
```

## Common Commands

- **Index a Query**

  Store a query locally:

  ```sh
  npx @darbotlabs/darbot-kusto index MyQuery --query "StormEvents | take 5"
  ```

  Share a query with your team:

  ```sh
  npx @darbotlabs/darbot-kusto index TeamQuery path/to/query.kql --global
  ```

  Local queries are saved in `query-index/local/` while shared ones are stored in `query-index/shared/`.
  Execute an indexed query by passing its contents to the `query` command, e.g.:

  ```sh
  npx @darbotlabs/darbot-kusto query "$(cat query-index/local/MyQuery.kql)"
  ```

- **List Available Templates**

  ```sh
  npx @darbotlabs/darbot-kusto list-templates
  ```

## Prerequisites

- **Azure CLI**: Required for authentication and running Kusto queries. Download the installer from the repository (`AzureCLI.msi`) or from the official Microsoft page.

### Installing Azure CLI

You can install the Azure CLI using the provided installer:

```sh
# From the root of this repository
msiexec /i AzureCLI.msi
```

After installation, restart your terminal and verify with:

```sh
az --version
```

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

This project is licensed under the MIT License.

## Additional Resources

- [Advanced Usage](./docs/advanced.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Kusto Query Language](./src/resources/Kusto-Query-Language/README.md)

## Continuous Integration

Our GitHub Actions workflow installs dependencies, lints Markdown, and runs the test suite on every push and pull request. A separate workflow publishes the package to npm when a release is created.

## Exposing Functionality

### VSCode Extension

The Darbot Kusto MCP extension for VSCode allows you to run Kusto queries directly from the editor. You can install it from the VSCode marketplace and configure it to use your Kusto cluster and database.
See [docs/vscode.md](./docs/vscode.md) for sample keybindings and tasks.

### MCP Connector

The MCP connector allows you to run Kusto queries from the MCP UI. You can configure it by adding the following to your MCP config:

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto/src/server.js"
  ]
}
```

This will allow you to run Kusto queries securely using your Windows/Entra/az login credentials by default.

You can also execute simple natural language queries:

```sh
npx @darbotlabs/darbot-kusto nlquery "how many events last week?"
```

### Running a Kusto Query via MCP Server

When configured as above, the MCP server starts a REPL (interactive prompt). You can type or send a Kusto query directly to the server:

1. **Start the server** (from MCP UI or manually):

   ```sh
   npx @darbotlabs/darbot-kusto/src/server.js --cluster <ClusterUrl> --database <Database>
   ```

2. **At the `kusto>` prompt, enter your query** (e.g., `print 1`) and press Enter.
3. **The result will be printed as JSON.**
4. **Type `exit` or `quit` to stop the server.**

You can also automate this by piping a query:

```sh
  echo "print 1" | npx @darbotlabs/darbot-kusto/src/server.js --cluster <ClusterUrl> --database <Database>
```
