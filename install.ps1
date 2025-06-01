# Minimal install script: only install dependencies
Write-Output "Installing necessary dependencies..."
npm install

# Install Azure CLI if not present
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Host "Azure CLI not found. Installing from AzureCLI.msi..." -ForegroundColor Yellow
    if (Test-Path "$PSScriptRoot\AzureCLI.msi") {
        Start-Process msiexec.exe -Wait -ArgumentList "/I `"$PSScriptRoot\AzureCLI.msi`" /quiet"
        Write-Host "Azure CLI installation complete. Please restart your terminal if 'az' is not recognized." -ForegroundColor Green
    } else {
        Write-Host "AzureCLI.msi not found in the repository root. Please download it and place it in the repo." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Azure CLI is already installed." -ForegroundColor Green
}
