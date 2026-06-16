# Aide configuration rclone onedrive_backup (interactif — a lancer dans PowerShell).

$remoteName = "onedrive_backup"

function Invoke-Rclone {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$RcloneArgs)
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = & rclone @RcloneArgs 2>&1
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
    foreach ($line in $output) {
        if ($line -and $line -notmatch "^2026/.*NOTICE:") { Write-Host $line }
    }
    return $code
}

if (-not (Get-Command rclone -ErrorAction SilentlyContinue)) {
    Write-Error "rclone introuvable dans le PATH."
}

$code = Invoke-Rclone lsd "${remoteName}:"
if ($code -eq 0) {
    Write-Host "Remote '${remoteName}' OK." -ForegroundColor Green
    exit 0
}

Write-Host "Configuration requise (interactive, ~2 min)." -ForegroundColor Cyan
Write-Host ""
Write-Host "Le script automatique echoue souvent (mauvais lecteur OneDrive)." -ForegroundColor Yellow
Write-Host "Lance maintenant:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  rclone config" -ForegroundColor Green
Write-Host ""
Write-Host "Reponses:" -ForegroundColor Cyan
Write-Host "  n                          nouveau remote"
Write-Host "  onedrive_backup            nom"
Write-Host "  onedrive                   type (ou numero affiche)"
Write-Host "  [Entree]                   client_id, secret, region global"
Write-Host "  n                          pas de config avancee"
Write-Host "  y                          auto config -> navigateur"
Write-Host "  [choix]                    OneDrive PERSONNEL uniquement"
Write-Host ""
Write-Host "Puis teste:" -ForegroundColor Cyan
Write-Host "  rclone lsd onedrive_backup:"
Write-Host "  .\scripts\backup-to-onedrive.ps1"
Write-Host ""

$launch = Read-Host "Ouvrir rclone config maintenant ? (o/n)"
if ($launch -eq "o") {
    rclone config
}
