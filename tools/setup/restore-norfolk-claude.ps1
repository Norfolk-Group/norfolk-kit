$root = Split-Path -Parent $PSScriptRoot
$claudeRoot = Join-Path $HOME ".claude"
$skillsRoot = Join-Path $claudeRoot "skills"
$workspaceClaude = Join-Path $HOME "workspace\.claude\commands"

New-Item -ItemType Directory -Force -Path $claudeRoot | Out-Null
New-Item -ItemType Directory -Force -Path $skillsRoot | Out-Null
New-Item -ItemType Directory -Force -Path $workspaceClaude | Out-Null

Copy-Item (Join-Path $root "claude-code\settings.template.json") (Join-Path $claudeRoot "settings.json") -Force
Copy-Item (Join-Path $root "claude-code\skills\*") $skillsRoot -Recurse -Force
Copy-Item (Join-Path $root "claude-code\commands\*") $workspaceClaude -Recurse -Force

Write-Host "Norfolk AI Claude setup restored."
