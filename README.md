
# darbot-kusto

A connector for running Kusto queries from VSCode.
Darbot Labs: <https://github.com/darbotlabs/darbot-kusto>

## Quick Start

Add this to your MCP config (VS Code, Claude Desktop, etc):

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto"
  ]
}
```

You can now start the server from the MCP UI and run Kusto queries securely using your Windows/Entra/az login credentials by default.
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
