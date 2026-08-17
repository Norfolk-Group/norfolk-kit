# claude-launcher-lib.ps1 — shared core for the claude-<model>.ps1 launchers (Windows twin
# of claude-launcher-lib.sh; keep the two in sync).
#
# Each wrapper sets the provider contract, dot-sources this file, then calls
# Invoke-ClaudeLauncher:
#
#   $LauncherName     display name for messages           (e.g. "claude-qwen.ps1")
#   $LauncherBaseUrl  Anthropic-protocol base URL         (provider direct, or https://openrouter.ai/api)
#   $LauncherKeyVar   name of the secret holding the key  (e.g. "MOONSHOT_API_KEY")
#   $LauncherPrimary  model id for opus/sonnet/subagent tiers
#   $LauncherFast     model id for the haiku tier         (defaults to $LauncherPrimary)
#
# Tier remap instead of a raw ANTHROPIC_MODEL slug: Claude Code 2.1.x rejects unknown
# raw slugs but passes ANTHROPIC_DEFAULT_*_MODEL through to the base URL verbatim —
# official mechanism per code.claude.com/docs model-config ("sonnet" is a CC-native
# tier alias; the DEFAULT_*_MODEL vars are unvalidated pass-through for custom
# endpoints). Debugging provenance: PR #935. Secrets: env → ONE batched Doppler
# download → legacy .env (PR #948 semantics). PowerShell 5.1 compatible.
#
# DEV TOOLING ONLY (CLAUDE.md §1).

$ErrorActionPreference = 'Stop'
$script:LibLauncherDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# The repo this launcher is being run for — NOT the launcher's own folder.
try {
  $script:LibRepoRoot = (git -C $PWD rev-parse --show-toplevel 2>$null)
  if (-not $script:LibRepoRoot) { $script:LibRepoRoot = $PWD.Path }
} catch {
  $script:LibRepoRoot = $PWD.Path
}

$script:DopplerBatch = $null
$script:DopplerState = 'unfetched'   # unfetched | ok | failed

# Doppler project/config come from THIS repo's doppler.yaml.
#
# They used to be hardcoded to h-analytics/dev — a workaround for `doppler setup`
# no-opping in some containers, correct for the repo it was written in and wrong
# for every other one. Because this library is shared by every equipped repo, that
# default meant running a launcher inside Obra Pía silently fetched H-Analytics'
# secrets, DATABASE_URL included. That is the same cross-project confusion that
# decision 0015 exists to prevent, sitting inside the tooling meant to prevent it.
#
# So: read the project from the repo, and if there is no doppler.yaml, resolve
# NOTHING rather than guessing. A missing key is a loud, correct failure; the
# wrong project's key is a silent, wrong success.
function Read-DopplerYaml {
  param([Parameter(Mandatory = $true)][string]$Key)
  $file = Join-Path $script:LibRepoRoot 'doppler.yaml'
  if (-not (Test-Path $file)) { return $null }
  $content = Get-Content $file -Raw
  if ($content -match "(?m)^\s*${Key}:\s*['\`"]?([^'\`"\s]+)['\`"]?\s*$") {
    return $Matches[1]
  }
  return $null
}

$script:LibDopplerProject = if ($env:DOPPLER_PROJECT) { $env:DOPPLER_PROJECT } else { Read-DopplerYaml -Key 'project' }
$script:LibDopplerConfig  = if ($env:DOPPLER_CONFIG)  { $env:DOPPLER_CONFIG }  else { Read-DopplerYaml -Key 'config' }

function Get-LauncherDopplerBatch {
  if ($script:DopplerState -ne 'unfetched') { return }
  if (-not (Get-Command doppler -ErrorAction SilentlyContinue)) {
    $script:DopplerState = 'failed'
    Write-Host "$($LauncherName): doppler CLI not installed - resolving secrets from env/.env only." -ForegroundColor Yellow
    return
  }
  if (-not $script:LibDopplerProject) {
    $script:DopplerState = 'failed'
    Write-Host "$($LauncherName): no Doppler project for this repo - expected a 'project:' in $($script:LibRepoRoot)/doppler.yaml, or DOPPLER_PROJECT set. Resolving from env/.env only." -ForegroundColor Yellow
    return
  }
  # Project/config passed as FLAGS so nothing leaks into the child claude process env
  # (an inherited DOPPLER_* pair could silently redirect other doppler-using tooling).
  $dopplerProject = $script:LibDopplerProject
  $dopplerConfig  = if ($script:LibDopplerConfig) { $script:LibDopplerConfig } else { 'dev' }
  try {
    $json = doppler secrets download --project $dopplerProject --config $dopplerConfig --no-file --format json 2>$null
    if ($LASTEXITCODE -eq 0 -and $json) {
      $script:DopplerBatch = $json | ConvertFrom-Json
      $script:DopplerState = 'ok'
      return
    }
  } catch { }
  $script:DopplerState = 'failed'
  Write-Host "$($LauncherName): Doppler fetch failed (not logged in? run 'doppler login') - resolving secrets from env/.env only." -ForegroundColor Yellow
}

function Resolve-LauncherSecret {
  param([Parameter(Mandatory = $true)][string]$Name)
  # Names reach Select-String patterns below - accept env-var identifiers only.
  if ($Name -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') {
    Write-Error "$($LauncherName): invalid secret name '$Name'"
    return $null
  }
  # Priority: process env -> batched Doppler download -> legacy .env.
  $value = [Environment]::GetEnvironmentVariable($Name)
  if (-not $value) {
    Get-LauncherDopplerBatch
    if ($script:DopplerState -eq 'ok') {
      $prop = $script:DopplerBatch.PSObject.Properties[$Name]
      if ($prop) { $value = [string]$prop.Value }
    }
  }
  if (-not $value) {
    $envFile = Join-Path $script:LibRepoRoot '.env'
    if (Test-Path $envFile) {
      # Legacy fallback only (last-line-wins loader semantics).
      $line = Select-String -Path $envFile -Pattern "^$Name=" | Select-Object -Last 1
      # Strip any trailing inline "# comment" fragment BEFORE trimming quotes — a
      # "KEY=secret # note" entry must not corrupt the secret with the note.
      if ($line) { $value = ($line.Line -replace "^$Name=", '' -replace '\s+#.*$', '').Trim().Trim('"').Trim("'") }
    }
  }
  return $value
}

function Invoke-ClaudeLauncher {
  param([string[]]$PassthroughArgs = @())

  if (-not $LauncherName -or -not $LauncherBaseUrl -or -not $LauncherKeyVar -or -not $LauncherPrimary) {
    Write-Error 'launcher contract incomplete: LauncherName/LauncherBaseUrl/LauncherKeyVar/LauncherPrimary are required.'
    exit 1
  }
  $fast = if ($LauncherFast) { $LauncherFast } else { $LauncherPrimary }

  $key = Resolve-LauncherSecret -Name $LauncherKeyVar
  if (-not $key) {
    $dopplerRef = if ($script:LibDopplerProject) { "$($script:LibDopplerProject)/$(if ($script:LibDopplerConfig) { $script:LibDopplerConfig } else { 'dev' })" } else { '(no project)' }
    Write-Error "$($LauncherName): $LauncherKeyVar not found in env, Doppler ($dopplerRef), or .env. Add it in the Doppler dashboard, or set it in this shell."
    exit 1
  }

  # Drop leftover routing from another provider/launcher in this shell (OpenAI
  # Grok recipe hygiene, 2026-07-24) so a prior Qwen/GLM/Claude session cannot
  # half-bleed model ids into this process. FABLE is owned by wrappers that set
  # it before Invoke-ClaudeLauncher — do not clear it here.
  foreach ($v in @(
      'ANTHROPIC_MODEL', 'ANTHROPIC_SMALL_FAST_MODEL',
      'ANTHROPIC_DEFAULT_OPUS_MODEL', 'ANTHROPIC_DEFAULT_SONNET_MODEL',
      'ANTHROPIC_DEFAULT_HAIKU_MODEL',
      'CLAUDE_CODE_SUBAGENT_MODEL'
    )) {
    Remove-Item "env:$v" -ErrorAction SilentlyContinue
  }

  # Anthropic-protocol wiring: AUTH_TOKEN carries the provider key; ANTHROPIC_API_KEY
  # is REMOVED (PS 5.1 treats '' assignment as deletion anyway) so Claude Code never
  # authenticates against Anthropic directly.
  $env:ANTHROPIC_BASE_URL   = $LauncherBaseUrl
  $env:ANTHROPIC_AUTH_TOKEN = $key
  Remove-Item 'env:ANTHROPIC_API_KEY' -ErrorAction SilentlyContinue
  # Key lives only on AUTH_TOKEN for this session (avoid dual env exposure).
  Remove-Item "env:$LauncherKeyVar" -ErrorAction SilentlyContinue

  # Opt-in escape hatch (GLM only, 2026-07-24): Ricardo's validated-working ad-hoc
  # invocation unsets ANTHROPIC_MODEL entirely rather than aliasing to "sonnet",
  # relying on --model <tier> + the DEFAULT_*_MODEL maps instead. Default is
  # unchanged for every other launcher.
  # NOTE: do NOT put a raw third-party slug in ANTHROPIC_MODEL / --model — Claude
  # Code 2.1.x rejects unknown raw slugs ("issue with the selected model"). The
  # tier name + DEFAULT_*_MODEL map is the documented custom-endpoint contract.
  if (-not $LauncherSkipModelAlias) {
    $env:ANTHROPIC_MODEL = 'sonnet'
  } else {
    Remove-Item 'env:ANTHROPIC_MODEL' -ErrorAction SilentlyContinue
  }
  # Sonnet slot defaults to the primary; a launcher may set $LauncherSonnetModel
  # for a genuinely three-tier map (OpenAI: sol-pro/terra/luna, 2026-07-24).
  $env:ANTHROPIC_DEFAULT_SONNET_MODEL = if ($LauncherSonnetModel) { $LauncherSonnetModel } else { $LauncherPrimary }
  $env:ANTHROPIC_DEFAULT_OPUS_MODEL   = $LauncherPrimary
  $env:ANTHROPIC_DEFAULT_HAIKU_MODEL  = $fast
  $env:ANTHROPIC_SMALL_FAST_MODEL     = $fast
  # Subagent model defaults to the primary; a launcher may set $LauncherSubagentModel
  # to route subagents to a cheaper tier (Qwen: qwen3.7-plus, 2026-07-24).
  $env:CLAUDE_CODE_SUBAGENT_MODEL     = if ($LauncherSubagentModel) { $LauncherSubagentModel } else { $LauncherPrimary }

  # MCP dev-tooling keys (.mcp.json ${VAR} expansions) — allowlisted set only, so
  # servers like greptile don't 403 on an empty Bearer header in launcher sessions.
  foreach ($mcpVar in @('GREPTILE_API_KEY', 'RESEND_API_KEY', 'EXA_API_KEY', 'FRED_API_KEY', 'RAPIDAPI_KEY', 'FIGMA_API_KEY')) {
    if (-not [Environment]::GetEnvironmentVariable($mcpVar)) {
      $mcpVal = Resolve-LauncherSecret -Name $mcpVar
      if ($mcpVal) { [Environment]::SetEnvironmentVariable($mcpVar, $mcpVal) }
    }
  }

  # Keep DB/secret env out of the launched agent (mirror launch-claude.ps1).
  foreach ($v in @('DATABASE_URL', 'POSTGRES_URL', 'NEON_API_KEY', 'APIFY_API_TOKEN')) {
    Remove-Item "env:$v" -ErrorAction SilentlyContinue
  }

  if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "$($LauncherName): 'claude' CLI not found on PATH. Install it: npm i -g @anthropic-ai/claude-code"
    exit 1
  }

  Write-Host "$($LauncherName): launching Claude Code on $LauncherPrimary via $LauncherBaseUrl ..."
  & claude @PassthroughArgs
}
