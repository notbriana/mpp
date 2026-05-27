<#
Helper to start the backend on HTTP and open Windows Firewall for port 3001.
Usage: run this in an elevated PowerShell (as Administrator) to add firewall rule.
If you don't want to add the firewall rule, run the unset lines and then `npm start`.
#>

Write-Host "Unsetting HTTPS env vars (will force HTTP startup)"
$env:HTTPS_KEY_PATH = $null
$env:HTTPS_CERT_PATH = $null

try {
  $rule = Get-NetFirewallRule -DisplayName 'mpp-backend-3001' -ErrorAction SilentlyContinue
  if (-not $rule) {
    Write-Host "Adding firewall rule to allow TCP 3001 from any remote address"
    New-NetFirewallRule -DisplayName 'mpp-backend-3001' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001 -Profile Any | Out-Null
  } else {
    Write-Host "Firewall rule 'mpp-backend-3001' already exists"
  }
} catch {
  Write-Warning "Could not manage firewall rules (are you running as Administrator?)"
}

Write-Host "Starting backend (HTTP) via npm start..."
npm start
