# Backup ManabuPlay vers OneDrive via rclone (filet de sécurité, pas un remplacement de git).
# Usage:
#   .\scripts\backup-to-onedrive.ps1           # dry-run
#   .\scripts\backup-to-onedrive.ps1 -Apply    # sync réel

param(
    [switch]$Apply,
    [string]$Remote = "onedrive_backup",
    [string]$RemotePath = "Entrepreneur/_backups/manabuplay"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path $PSScriptRoot -Parent
$src = (Resolve-Path $repoRoot).Path
$dst = "${Remote}:${RemotePath}"
$filter = Join-Path $PSScriptRoot "rclone-filter.txt"
$logDir = "C:\dev\cache\manabuplay\rclone-logs"

if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
    Write-Error "rclone introuvable dans le PATH. Ajoute C:\rclone ou redémarre le terminal."
}

if (-not (Test-Path $filter)) {
    Write-Error "Filtre introuvable: $filter"
}

$remotes = @()
$prev = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$remoteOut = & rclone listremotes 2>&1
$ErrorActionPreference = $prev
foreach ($line in $remoteOut) {
    if ($line -and $line -notmatch "NOTICE:") { $remotes += [string]$line }
}
if ($remotes -notcontains "${Remote}:") {
    Write-Host "Remote '$Remote' absent (rclone pas encore configure)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Une seule fois, dans ce terminal PowerShell:" -ForegroundColor Yellow
    Write-Host "  rclone config" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  n  > nouveau remote" -ForegroundColor Gray
    Write-Host "  onedrive_backup" -ForegroundColor Gray
    Write-Host "  onedrive  (ou son numero)" -ForegroundColor Gray
    Write-Host "  Entree partout (client_id, secret, region global)" -ForegroundColor Gray
    Write-Host "  n  > advanced config" -ForegroundColor Gray
    Write-Host "  y  > auto config (navigateur)" -ForegroundColor Gray
    Write-Host "  Choisir OneDrive PERSONNEL (pas SharePoint / Entreprise)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Test: rclone lsd onedrive_backup:" -ForegroundColor Yellow
    exit 1
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir ("backup-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

$commonArgs = @(
    "sync", $src, $dst,
    "--filter-from", $filter,
    "-P",
    "--log-file", $logFile,
    "--log-level", "INFO"
)

Write-Host "Source : $src"
Write-Host "Cible  : $dst"
Write-Host "Log    : $logFile"
Write-Host ""

if (-not $Apply) {
    Write-Host "Dry-run (aucune écriture). Pour appliquer: .\scripts\backup-to-onedrive.ps1 -Apply" -ForegroundColor Cyan
    & rclone @commonArgs --dry-run
    exit $LASTEXITCODE
}

Write-Host "Sync réel en cours..." -ForegroundColor Green
& rclone @commonArgs
exit $LASTEXITCODE
