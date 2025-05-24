# VS Code MCP Setup

This guide explains how to configure the MCP extension in VS Code to work with `darbot-kusto`.

## Configuration

1. Install the MCP extension from the VS Code marketplace.
2. Add the following to your `mcp.json` configuration:
   ```json
   "darbot-kusto": {
     "command": "npx",
     "args": [
       "@darbotlabs/darbot-kusto/src/server.js"
     ]
   }
   ```
   You may provide `--cluster` and `--database` arguments or set the `DARBOT_KUSTO_CLUSTER` and `DARBOT_KUSTO_DATABASE` environment variables to avoid prompts.

## Available Tools

- **Query Templates** – quickly insert pre-defined queries.
- **Parameterized Queries** – fill in parameters before execution.
- **Audit Command** – verify connectivity and permissions.

## Sample Keybinding

Create a task that runs the current file as a query and assign a keybinding to execute it:

```json
{
  "key": "ctrl+alt+k",
  "command": "workbench.action.tasks.runTask",
  "args": "Run Kusto Query"
}
```

More advanced setups can reference indexed queries from the `query-index` directory.

