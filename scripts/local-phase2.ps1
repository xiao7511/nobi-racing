param([ValidateSet('start','stop','status','sync')][string]$Action='start')
$ErrorActionPreference='Stop'
$workspace=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$stateDir=Join-Path $workspace '.cache/phase2'
$statePath=Join-Path $stateDir 'api-process.json'
$envPath=Join-Path $stateDir 'local.env'
$composePath=Join-Path $workspace 'infra/phase2-compose.yaml'
$jarPath=Join-Path $workspace 'services/racing-api/target/racing-api-0.0.0-SNAPSHOT.jar'
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
function Invoke-Compose {
    & docker compose --project-name nobi-racing-phase2 --env-file $envPath -f $composePath @args
    if($LASTEXITCODE -ne 0) { throw 'Phase 2 compose command failed.' }
}
function Get-OwnedApi {
    if(!(Test-Path -LiteralPath $statePath)) { return $null }
    $state=Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $process=Get-Process -Id $state.processId -ErrorAction SilentlyContinue
    if(!$process -or $process.StartTime.ToUniversalTime().Ticks -ne ([DateTimeOffset]$state.startedAt).UtcDateTime.Ticks) { return $null }
    $details=Get-CimInstance Win32_Process -Filter "ProcessId = $($state.processId)"
    if(!$details.CommandLine.Contains($jarPath)) { throw 'PID does not belong to this Phase 2 application.' }
    return $process
}
if($Action -eq 'status') {
    if(Get-OwnedApi) { Write-Output 'Phase 2 API: http://127.0.0.1:5280/api/v1/readiness' } else { Write-Output 'Phase 2 API is stopped.' }
    if(Test-Path -LiteralPath $envPath) { Invoke-Compose ps }
    exit
}
if($Action -eq 'stop') {
    $process=Get-OwnedApi
    if($process) { Stop-Process -Id $process.Id; Remove-Item -LiteralPath $statePath }
    if(Test-Path -LiteralPath $envPath) { Invoke-Compose down }
    Write-Output 'Phase 2 stopped. Database volume is preserved.'
    exit
}
if(!(Test-Path -LiteralPath $envPath)) {
    $lines=foreach($name in @('PHASE2_DB_OWNER_PASSWORD','PHASE2_DB_READER_PASSWORD','PHASE2_REDIS_PASSWORD')) {
        $random=[Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
        $value=[Convert]::ToBase64String($random).TrimEnd('=').Replace('+','-').Replace('/','_')
        $name+'='+$value
    }
    [IO.File]::WriteAllLines($envPath,$lines)
}
$settings=@{}
foreach($line in [IO.File]::ReadAllLines($envPath)) { $pair=$line.Split('=',2);$settings[$pair[0]]=$pair[1] }
$hash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($settings['PHASE2_REDIS_PASSWORD']))).ToLowerInvariant()
[IO.File]::WriteAllText((Join-Path $stateDir 'users.acl'),"user default off`nuser nobi on #$hash ~nobi:p2:* +@connection +get +set +incr +pexpire +eval +del +exists +pttl`n")
if(!(Test-Path -LiteralPath $jarPath)) { throw 'Build the backend first: mvn -f services/racing-api/pom.xml verify' }
if($Action -eq 'start' -and (Get-OwnedApi)) { Write-Output 'Phase 2 is already running at http://127.0.0.1:5280/api/v1/readiness';exit }
Invoke-Compose up -d --wait postgres redis
$names=@('DB_URL','DB_USER','DB_PASSWORD','DB_MIGRATE','REDIS_HOST','REDIS_PORT','REDIS_USER','REDIS_PASSWORD','CACHE_ENABLED','DATA_TERRITORY','PORT','BIND_ADDRESS','MIGRATION_DB_USER','MIGRATION_DB_PASSWORD','SPRING_PROFILES_ACTIVE')
$previous=@{}
foreach($name in $names) { $previous[$name]=[Environment]::GetEnvironmentVariable($name,'Process') }
try {
    $env:DB_URL='jdbc:postgresql://127.0.0.1:55473/nobi_racing'
    $env:DB_USER='nobi_migrator';$env:DB_PASSWORD=$settings['PHASE2_DB_OWNER_PASSWORD'];$env:DB_MIGRATE='true'
    $env:REDIS_HOST='127.0.0.1';$env:REDIS_PORT='56379';$env:REDIS_USER='nobi';$env:REDIS_PASSWORD=$settings['PHASE2_REDIS_PASSWORD']
    $env:CACHE_ENABLED='true';$env:DATA_TERRITORY='LOCAL';$env:PORT='5280';$env:BIND_ADDRESS='127.0.0.1'
    $env:MIGRATION_DB_USER=$null;$env:MIGRATION_DB_PASSWORD=$null;$env:SPRING_PROFILES_ACTIVE=$null
    & java -jar $jarPath --spring.profiles.active=local --spring.main.web-application-type=none --nobi.task=true *> (Join-Path $stateDir 'sync.log')
    if($LASTEXITCODE -ne 0) { throw 'Migration/synthetic sync failed. Inspect .cache/phase2/sync.log.' }
    if($Action -eq 'sync') { Write-Output 'Authorized synthetic synchronization completed.';exit }
    $reader=$settings['PHASE2_DB_READER_PASSWORD']
    $sql=@"
SELECT 'CREATE ROLE nobi_reader LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE' WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='nobi_reader')
\gexec
ALTER ROLE nobi_reader PASSWORD '$reader';
GRANT CONNECT ON DATABASE nobi_racing TO nobi_reader;
GRANT USAGE ON SCHEMA public TO nobi_reader;
GRANT SELECT ON series,seasons,circuits,race_events,race_sessions,drivers,teams,race_entries,season_entries,session_results,standing_snapshots,driver_standings,team_standings,data_source,source_grant,app_user,user_role TO nobi_reader;
"@
    $sql | & docker compose --project-name nobi-racing-phase2 --env-file $envPath -f $composePath exec -T postgres psql -q -v ON_ERROR_STOP=1 -U nobi_migrator -d nobi_racing
    if($LASTEXITCODE -ne 0) { throw 'Reader role provisioning failed.' }
    $env:DB_USER='nobi_reader';$env:DB_PASSWORD=$settings['PHASE2_DB_READER_PASSWORD'];$env:DB_MIGRATE='false'
    $process=Start-Process -FilePath (Get-Command java).Source -ArgumentList @('-jar',('"'+$jarPath+'"'),'--spring.profiles.active=local','--spring.flyway.enabled=false','--nobi.demo.seed=false','--nobi.sync.on-start=false') -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $stateDir 'api.log') -RedirectStandardError (Join-Path $stateDir 'api-error.log')
    @{ processId=$process.Id; startedAt=$process.StartTime.ToUniversalTime().ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath $statePath -Encoding UTF8
    for($attempt=0;$attempt -lt 40;$attempt++) {
        if($process.HasExited) { throw 'Phase 2 API exited. Inspect .cache/phase2/api.log.' }
        try { $response=Invoke-WebRequest -Uri 'http://127.0.0.1:5280/api/v1/readiness' -TimeoutSec 2 -UseBasicParsing;if($response.StatusCode -eq 200 -and ($response.Content | ConvertFrom-Json).phase -eq '2') { Write-Output 'Ready: http://127.0.0.1:5280/api/v1/readiness';exit } } catch { Start-Sleep -Milliseconds 500 }
    }
    throw 'Phase 2 readiness timed out.'
} finally { foreach($name in $names) { [Environment]::SetEnvironmentVariable($name,$previous[$name],'Process') } }
