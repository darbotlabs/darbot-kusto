# Advanced Usage

This document covers advanced usage scenarios for `darbot-kusto`.

## Authentication Options

While `darbot-kusto` defaults to using `DefaultAzureCredential` (leveraging your logged-in Azure CLI or VS Code Azure account), you can specify other authentication methods:

### Token Authentication

If you have a specific bearer token, you can use it directly.

**CLI:**

```sh
npx @darbotlabs/darbot-kusto --cluster <YourCluster> --database <YourDatabase> --token <YourBearerToken> query "StormEvents | count"
```

**MCP Configuration (`mcp.json`):**

Modify the `args` to include the token. **Note:** This is generally not recommended for security reasons if the `mcp.json` file is shared or not properly secured.

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto/src/server.js",
    "--token",
    "YOUR_ACCESS_TOKEN" // Replace with your token or use a secure way to inject this
  ]
}
```

```

### Azure AD Application (Service Principal)

For unattended scenarios or specific permissions, you can use an Azure AD Application.


**CLI:**

```sh
npx @darbotlabs/darbot-kusto --cluster <YourCluster> --database <YourDatabase> --aadAppId <YourAppID> --aadAppSecret <YourAppSecret> --tenantId <YourTenantID> query "StormEvents | count"
```

**MCP Configuration (`mcp.json`):**

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto/src/server.js",
    "--aadAppId",
    "YOUR_APP_ID",
    "--aadAppSecret",
    "YOUR_APP_SECRET", // Consider environment variables or secure stores for secrets
    "--tenantId",
    "YOUR_TENANT_ID"
  ]
}
```

```

## Using Query Templates

Query templates allow you to predefine common queries and execute them by name.

**CLI:**

```sh
npx @darbotlabs/darbot-kusto --cluster <YourCluster> --database <YourDatabase> --template <TemplateName>
```

**Available Templates:**

(This section would list templates from `kustoQueryTemplates.js`. For now, it's a placeholder.)

* `template1`: Description of template1.
* `template2`: Description of template2.
* `template3`: Description of template3.

## Programmatic Usage (Example)

While `darbot-kusto` is primarily a CLI/MCP tool, the core connector can be used programmatically if installed as a library (though this is not its main design).

```javascript
// This is a conceptual example. 
// The package is not primarily designed for direct programmatic use in this version.
// const KustoMCPConnector = require('@darbotlabs/darbot-kusto/src/mcpConnector'); // Adjust path if using locally

async function run() {
  // const connector = new KustoMCPConnector(); // This would need proper instantiation
  // await connector.initialize({
  //   cluster: 'your_cluster_url',
  //   database: 'your_database',
  //   // auth options if not default
  // });
  // const results = await connector.executeQuery('StormEvents | take 10');
  // console.log(results);
}
// run();

// run();
```

This example is illustrative. For robust programmatic interaction with Kusto, consider using the official Azure Kusto SDKs directly.

## Audit Command

The `audit` command allows you to perform an end-to-end functionality audit by running a series of predefined queries and validating their results.

**CLI:**

```sh
npx @darbotlabs/darbot-kusto --cluster <YourCluster> --database <YourDatabase> audit
```

This command will execute a set of predefined queries and check their results to ensure that the system is functioning correctly. The results of the audit will be displayed in the console.

**Example Output:**

```
Audit completed successfully: [
  { query: "StormEvents | count", status: "success" },
  { query: "StormEvents | take 10", status: "success" },
  { query: "StormEvents | summarize count() by State", status: "success" }
]
```

If any of the queries fail, the output will indicate which query failed and provide an error message.

**MCP Configuration (`mcp.json`):**

```json
"darbot-kusto": {
  "command": "npx",
  "args": [
    "@darbotlabs/darbot-kusto/src/server.js",
    "audit"
  ]
}
```

This configuration will allow you to run the audit command from the MCP UI.
