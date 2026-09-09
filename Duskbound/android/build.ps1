[CmdletBinding()]
param(
    [switch]$Placeholder,
    [string]$AssetDirectory,
    [string]$ToolingRoot
)
$ErrorActionPreference = 'Stop'
# Windows PowerShell 5.1 does not set $PSScriptRoot inside param() defaults, so fall back here.
if (-not $ToolingRoot) { $ToolingRoot = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.tooling' }
$projectRoot = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent))
$ToolingRoot = [IO.Path]::GetFullPath($ToolingRoot)
if (-not $AssetDirectory) {
    if (-not $Placeholder) {
        # Always compile the current game before packaging the default assets.
        & node (Join-Path $projectRoot 'tools/build.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Web build failed. Run pnpm install --frozen-lockfile before building the APK.' }
    }
    $AssetDirectory = if ($Placeholder) { Join-Path $PSScriptRoot 'placeholder' } else { Join-Path $projectRoot 'web' }
}
$AssetDirectory = [IO.Path]::GetFullPath($AssetDirectory)
if (-not (Test-Path -LiteralPath (Join-Path $AssetDirectory 'index.html'))) { throw "Missing asset index: $AssetDirectory" }
$manifestPath = Join-Path $PSScriptRoot 'AndroidManifest.xml'
[xml]$manifestDocument = Get-Content -LiteralPath $manifestPath -Raw -Encoding utf8
$androidNamespace = 'http://schemas.android.com/apk/res/android'
$versionName = $manifestDocument.DocumentElement.GetAttribute('versionName', $androidNamespace)
$versionCode = $manifestDocument.DocumentElement.GetAttribute('versionCode', $androidNamespace)
if ($versionName -notmatch '^\d+\.\d+\.\d+(?:[-.][A-Za-z0-9]+)*$' -or $versionCode -notmatch '^\d+$') {
    throw 'AndroidManifest.xml must define a safe semantic versionName and numeric versionCode.'
}

function Find-Tool([string]$Root, [string]$File) {
    $found = Get-ChildItem -LiteralPath $Root -Filter $File -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $found) { throw "Missing $File. Run android/install-toolchain.ps1 first." }
    return $found.FullName
}
function Run-Tool([string]$Executable, [string[]]$Arguments) {
    & $Executable @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Tool exited with code ${LASTEXITCODE}: $Executable" }
}
function Get-AssetStaging([string]$AssetDirectory, [string]$WorkDirectory) {
    # Do not use aapt2 -A: on Windows it stores asset subdirectories with backslashes.
    # Android's AssetManager looks entries up as literal strings and WebView only
    # requests forward slashes, so those resources would 404 on a real device.
    # Stage what should ship, then let jar write it (jar always uses forward slashes)
    # while excluding development sources and prompt notes.
    # Stage as apkroot/assets/...: `jar -C <dir> .` writes entries relative to <dir>,
    # and packaged resources must live under assets/.
    $staging = Join-Path $WorkDirectory 'apkroot'
    $prefix = $AssetDirectory.TrimEnd('\', '/') + '\'
    $skipTopLevel = @('src')
    $skipFiles = @('*.prompt.txt')
    $count = 0
    foreach ($file in Get-ChildItem -LiteralPath $AssetDirectory -File -Recurse) {
        $relative = $file.FullName.Substring($prefix.Length)
        if ($skipTopLevel -contains $relative.Split('\')[0]) { continue }
        if (@($skipFiles | Where-Object { $relative -like $_ }).Count -gt 0) { continue }
        $target = Join-Path (Join-Path $staging 'assets') $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
        Copy-Item -LiteralPath $file.FullName -Destination $target -Force
        $count++
    }
    if ($count -eq 0) { throw "No packageable assets found: $AssetDirectory" }
    Write-Host "Staged $count web asset(s) for packaging."
    return $staging
}
$javac = Find-Tool (Join-Path $ToolingRoot 'jdk17') 'javac.exe'
$jdkBin = Split-Path $javac -Parent
$java = Join-Path $jdkBin 'java.exe'
$jar = Join-Path $jdkBin 'jar.exe'
$keytool = Join-Path $jdkBin 'keytool.exe'
$aapt2 = Find-Tool (Join-Path $ToolingRoot 'android-build-tools') 'aapt2.exe'
$buildTools = Split-Path $aapt2 -Parent
$platformJar = Find-Tool (Join-Path $ToolingRoot 'android-platform') 'android.jar'
$work = Join-Path $PSScriptRoot ('build/run-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0, 6))
$classDirectory = Join-Path $work 'classes'
$dexDirectory = Join-Path $work 'dex'
$generatedDirectory = Join-Path $work 'generated'
$releaseDirectory = Join-Path $projectRoot 'releases'
New-Item -ItemType Directory -Force -Path $work,$classDirectory,$dexDirectory,$generatedDirectory,$releaseDirectory | Out-Null
$assetStaging = Get-AssetStaging -AssetDirectory $AssetDirectory -WorkDirectory $work
$compiledResources = Join-Path $work 'compiled-resources.zip'
$unsignedApk = Join-Path $work 'unsigned.apk'
$alignedApk = Join-Path $work 'aligned.apk'
$apkName = if ($Placeholder) { 'duskbound-shell-check.apk' } else { "暮边镇-$versionName.apk" }
$finalApk = Join-Path $releaseDirectory $apkName

Run-Tool $aapt2 @('compile', '--dir', (Join-Path $PSScriptRoot 'res'), '-o', $compiledResources)
Run-Tool $aapt2 @('link', '-o', $unsignedApk, '--manifest', $manifestPath, '-I', $platformJar, '--java', $generatedDirectory, '--min-sdk-version', '26', '--target-sdk-version', '35', $compiledResources)
$sources = @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'src'),$generatedDirectory -Filter '*.java' -File -Recurse | ForEach-Object FullName)
Run-Tool $javac (@('-encoding', 'UTF-8', '-source', '8', '-target', '8', '-bootclasspath', $platformJar, '-d', $classDirectory) + $sources)
$classFiles = @(Get-ChildItem -LiteralPath $classDirectory -Filter '*.class' -File -Recurse | ForEach-Object FullName)
Run-Tool $java (@('-cp', (Join-Path $buildTools 'lib/d8.jar'), 'com.android.tools.r8.D8', '--min-api', '26', '--lib', $platformJar, '--output', $dexDirectory) + $classFiles)
Run-Tool $jar @('uf', $unsignedApk, '-C', $assetStaging, '.', '-C', $dexDirectory, 'classes.dex')
$apkEntries = @(& $jar tf $unsignedApk 2>&1)
if ($LASTEXITCODE -ne 0) { throw 'Unable to list APK entries.' }
$backslashEntries = @($apkEntries | Where-Object { $_ -like '*\*' })
if ($backslashEntries.Count -gt 0) { throw "APK contains backslash asset paths that Android cannot read: $($backslashEntries -join ', ')" }
Write-Host "APK asset entries use forward slashes."
Run-Tool (Join-Path $buildTools 'zipalign.exe') @('-f', '-P', '16', '4', $unsignedApk, $alignedApk)

# This is a local development certificate. Keep it to install later builds as updates.
$keyDirectory = Join-Path $PSScriptRoot 'keys'
$keystore = Join-Path $keyDirectory 'debug.keystore'
New-Item -ItemType Directory -Force -Path $keyDirectory | Out-Null
if (-not (Test-Path -LiteralPath $keystore)) {
    Run-Tool $keytool @('-genkeypair', '-keystore', $keystore, '-storepass', 'android', '-keypass', 'android', '-alias', 'androiddebugkey', '-keyalg', 'RSA', '-keysize', '2048', '-validity', '10000', '-dname', 'CN=Duskbound Local Development,O=Duskbound,C=CN', '-noprompt')
}
$signer = Join-Path $buildTools 'lib/apksigner.jar'
Run-Tool $java @('-jar', $signer, 'sign', '--ks', $keystore, '--ks-key-alias', 'androiddebugkey', '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', $finalApk, $alignedApk)
$verification = & $java -jar $signer verify --verbose --print-certs $finalApk 2>&1
if ($LASTEXITCODE -ne 0) { throw "APK signature verification failed: $verification" }
$manifest = & $aapt2 dump badging $finalApk 2>&1
if ($LASTEXITCODE -ne 0) { throw "APK manifest verification failed: $manifest" }
Run-Tool (Join-Path $buildTools 'zipalign.exe') @('-c', '-P', '16', '4', $finalApk)
$sha = (Get-FileHash -LiteralPath $finalApk -Algorithm SHA256).Hash.ToLowerInvariant()
$sha | Set-Content -LiteralPath ($finalApk + '.sha256') -Encoding ascii
$report = @("APK: $apkName", "Version: $versionName ($versionCode)", "Built UTC: $([DateTime]::UtcNow.ToString('s'))", "Assets: $AssetDirectory", "SHA256: $sha", '', 'SIGNATURE', $verification, '', 'MANIFEST', $manifest)
$report | Set-Content -LiteralPath (Join-Path $releaseDirectory ($apkName + '.verification.txt')) -Encoding utf8
Write-Host ($verification -join [Environment]::NewLine)
Write-Host ($manifest -join [Environment]::NewLine)
Write-Host "APK ready: $finalApk"
