$defaultSdk = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$sdk = if ($env:ANDROID_HOME -and (Test-Path $env:ANDROID_HOME)) {
  $env:ANDROID_HOME
} else {
  $defaultSdk
}

$requiredTools = @(
  (Join-Path $sdk 'platform-tools\adb.exe'),
  (Join-Path $sdk 'emulator\emulator.exe')
)

$missingTools = $requiredTools | Where-Object { -not (Test-Path $_) }
if ($missingTools) {
  throw "Android SDK tools are missing. Expected: $($missingTools -join ', ')"
}

$env:ANDROID_HOME = $sdk
$toolDirectories = @(
  (Join-Path $sdk 'platform-tools'),
  (Join-Path $sdk 'emulator')
)
foreach ($directory in $toolDirectories) {
  if (($env:Path -split ';') -notcontains $directory) {
    $env:Path = "$directory;$env:Path"
  }
}

$expo = Join-Path $PSScriptRoot '..\node_modules\.bin\expo.cmd'
& $expo start --android
exit $LASTEXITCODE
