<p align="center">
  <img src="logo.png" alt="darbot-kusto logo" width="120"/>
</p>

# darbot-kusto


# darbot-kusto

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

The `darbot-kusto` extension for VSCode allows you to run Kusto queries directly from the editor. You can install it from the VSCode marketplace and configure it to use your Kusto cluster and database.
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
