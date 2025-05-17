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

## CLI Usage

```sh
npx @darbotlabs/darbot-kusto --cluster <ClusterUrl> --database <Database> query "<Your Kusto Query>"
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

## Exposing Functionality

### VSCode Extension

The `darbot-kusto` extension for VSCode allows you to run Kusto queries directly from the editor. You can install it from the VSCode marketplace and configure it to use your Kusto cluster and database.

### MCP Connector

The MCP connector allows you to run Kusto queries from the MCP UI. You can configure it by adding the following to your MCP config:

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto"
  ]
}
```

This will allow you to run Kusto queries securely using your Windows/Entra/az login credentials by default.
