[CmdletBinding()]
param([string]$ToolingRoot = (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.tooling'))
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$ToolingRoot = [IO.Path]::GetFullPath($ToolingRoot)
$downloadRoot = Join-Path $ToolingRoot 'downloads'
New-Item -ItemType Directory -Force -Path $downloadRoot | Out-Null

# Pinned official archives. Google publishes SHA-1 in its SDK repository index;
# Microsoft publishes SHA-256 alongside its OpenJDK release.
$packages = @(
    @{Url='https://dl.google.com/android/repository/build-tools_r35_windows.zip'; File='build-tools_r35_windows.zip'; Hash='af059bb67cf7786f45ee0db85e2d24985df1b4b6'; Algorithm='SHA1'; Directory='android-build-tools'},
    @{Url='https://dl.google.com/android/repository/platform-35_r02.zip'; File='android-platform35.zip'; Hash='0bb560a90a7a2cbd0dd8348224d518b638fe7949'; Algorithm='SHA1'; Directory='android-platform'},
    @{Url='https://aka.ms/download-jdk/microsoft-jdk-17.0.20.1-windows-x64.zip'; File='microsoft-jdk17.zip'; Hash='3d9006956fc8af5601cd24ffc4f468bef48279c7ebd8171b9bdf90d0aabfbf1f'; Algorithm='SHA256'; Directory='jdk17'}
)
foreach ($package in $packages) {
    $archive = Join-Path $downloadRoot $package.File
    $valid = (Test-Path -LiteralPath $archive) -and ((Get-FileHash -LiteralPath $archive -Algorithm $package.Algorithm).Hash -eq $package.Hash)
    if (-not $valid) {
        Write-Host "Downloading $($package.File) from the official publisher..."
        & curl.exe -fL --connect-timeout 20 --max-time 900 --retry 2 --silent --show-error $package.Url -o $archive
        if ($LASTEXITCODE -ne 0) { throw "Download failed: $($package.Url)" }
    }
    if ((Get-FileHash -LiteralPath $archive -Algorithm $package.Algorithm).Hash -ne $package.Hash) {
        throw "Checksum mismatch: $archive"
    }
    $destination = Join-Path $ToolingRoot $package.Directory
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
    Write-Host "Verified and extracted $($package.File)"
}
Write-Host "Toolchain ready: $ToolingRoot"
