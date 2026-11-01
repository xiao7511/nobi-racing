param([ValidateSet('start','stop','status')][string]$Action='start')
$ErrorActionPreference='Stop'
$workspace=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateDir=Join-Path $workspace '.cache/local-translation'
$statePath=Join-Path $stateDir 'process.json'
$python=Join-Path $workspace '.tools/translation/venv/Scripts/python.exe'
$server=Join-Path $workspace 'services/local-translation/server.py'
$model=Join-Path $workspace '.tools/translation/model'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
function Get-OwnedTranslation {
    if(!(Test-Path -LiteralPath $statePath)){return $null}
    $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $process=Get-Process -Id $state.processId -ErrorAction SilentlyContinue
    if(!$process -or $process.StartTime.ToUniversalTime().Ticks -ne ([DateTimeOffset]$state.startedAt).UtcDateTime.Ticks){return $null}
    $details=Get-CimInstance Win32_Process -Filter "ProcessId = $($state.processId)"
    if(!$details.CommandLine.Contains('local-translation/server.py') -and !$details.CommandLine.Contains('local-translation\server.py')){throw 'Translation process mismatch'}
    return $process
}
$owned=Get-OwnedTranslation
if($Action -eq 'status'){if($owned){Write-Output 'Offline translation: http://127.0.0.1:5291/health'}else{Write-Output 'Offline translation stopped'};exit}
if($Action -eq 'stop'){if($owned){Stop-Process -Id $owned.Id};exit}
if($owned){Write-Output 'Offline translation already running';exit}
if(!(Test-Path -LiteralPath $python) -or !(Test-Path -LiteralPath $model)){throw 'Install the project translation environment and verified model first. See services/local-translation/README.md.'}
$process=Start-Process -FilePath $python -ArgumentList @(('"'+$server+'"'),'--model',('"'+$model+'"'),'--port','5291') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $stateDir 'service.log') -RedirectStandardError (Join-Path $stateDir 'error.log')
@{processId=$process.Id;startedAt=$process.StartTime.ToUniversalTime().ToString('o')} | ConvertTo-Json | Set-Content -LiteralPath $statePath
Write-Output 'Offline translation starting on 127.0.0.1:5291; check /health before enabling API translation.'
