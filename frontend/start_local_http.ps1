<#
Helper to start the frontend dev server bound to all interfaces and open Windows Firewall for port 5173.
Run in an elevated PowerShell (Administrator) to add the firewall rule.
Usage:
  cd E:\mpp\frontend
  .\start_local_http.ps1
#>

Write-Host "Starting frontend dev server on all interfaces (0.0.0.0) and opening firewall for 5173"

try {
  $rule = Get-NetFirewallRule -DisplayName 'vite-5173' -ErrorAction SilentlyContinue
  if (-not $rule) {
    Write-Host "Adding firewall rule to allow TCP 5173 from any remote address"
    New-NetFirewallRule -DisplayName 'vite-5173' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173 -Profile Any | Out-Null
  } else {
    Write-Host "Firewall rule 'vite-5173' already exists"
  }
} catch {
  Write-Warning "Could not manage firewall rules (are you running as Administrator?)"
}

Write-Host "Running: npm run dev -- --host 0.0.0.0"
npm run dev -- --host 0.0.0.0
