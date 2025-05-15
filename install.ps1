# PowerShell script to install necessary dependencies and configure VSCode JSON file

# Install necessary dependencies
Write-Output "Installing necessary dependencies..."
npm install

# Configure VSCode JSON file to add MCP connector config
Write-Output "Configuring VSCode JSON file..."
$vscodeConfigPath = ".vscode/settings.json"
if (-Not (Test-Path $vscodeConfigPath)) {
    New-Item -ItemType File -Path $vscodeConfigPath -Force
}

$vscodeConfig = Get-Content $vscodeConfigPath | Out-String | ConvertFrom-Json
$vscodeConfig["mcp.connector"] = @{
    "name" = "darbot-kusto-mcp"
    "type" = "kusto"
    "command" = "node src/mcpConnector.js"
}

$vscodeConfig | ConvertTo-Json | Set-Content $vscodeConfigPath

Write-Output "Installation and configuration complete."
