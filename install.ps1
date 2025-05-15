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
    "name" = "darbot-kusto"
    "type" = "kusto"
    "command" = "node src/kustoConnector.js"
}
$vscodeConfig["mcp.queryTemplates"] = @{
    "template1" = "Kusto query template 1"
    "template2" = "Kusto query template 2"
    "template3" = "Kusto query template 3"
}

# Add configuration for auto-completion, syntax highlighting, and error checking for Kusto query syntax
$vscodeConfig["editor.quickSuggestions"] = @{
    "other" = $true
    "comments" = $false
    "strings" = $true
}
$vscodeConfig["editor.suggestOnTriggerCharacters"] = $true
$vscodeConfig["editor.suggestSelection"] = "first"
$vscodeConfig["editor.acceptSuggestionOnEnter"] = "on"
$vscodeConfig["editor.acceptSuggestionOnCommitCharacter"] = $true
$vscodeConfig["editor.wordBasedSuggestions"] = $true
$vscodeConfig["editor.parameterHints.enabled"] = $true
$vscodeConfig["editor.hover.enabled"] = $true

# Add configuration for visual query builder in VSCode
$vscodeConfig["mcp.visualQueryBuilder"] = @{
    "enabled" = $true
    "command" = "MCP: Open Visual Query Builder"
}

$vscodeConfig | ConvertTo-Json | Set-Content $vscodeConfigPath

Write-Output "Installation and configuration complete."
