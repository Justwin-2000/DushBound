[CmdletBinding()]
param(
    [string]$ToolingRoot = (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.tooling'),
    [int]$ParallelDownloads = 24,
    [ValidateSet(26,35)][int]$SystemApi = 26
)
$ErrorActionPreference = 'Stop'
$ToolingRoot = [IO.Path]::GetFullPath($ToolingRoot)
$downloads = Join-Path $ToolingRoot 'downloads'
$sdk = Join-Path $ToolingRoot 'android-runtime-sdk'
New-Item -ItemType Directory -Force -Path $downloads,$sdk | Out-Null
$packages = @(
    @{Name='emulator-37'; Url='https://dl.google.com/android/repository/emulator-windows_x64-15917651.zip'; Size=441926448L; Sha1='54fa750822ff462d57e04fc8e98e60f08df2bb61'; Destination=$sdk},
    @{Name='android-platform-tools'; Url='https://dl.google.com/android/repository/platform-tools_r37.0.1-win.zip'; Size=8044989L; Sha1='e03e78b1d80b396f1c3358e31251cb31740e1110'; Destination=$sdk}
)
$packages += if ($SystemApi -eq 26) {
    @{Name='android26-system'; Url='https://dl.google.com/android/repository/sys-img/android/x86-26_r01.zip'; Size=350195807L; Sha1='e613d6e0da668e30daf547f3c6627a6352846f90'; Destination=(Join-Path $sdk 'system-images/android-26/default')}
} else {
    @{Name='android35-system'; Url='https://dl.google.com/android/repository/sys-img/android/x86_64-35_r02.zip'; Size=782404023L; Sha1='2d857d170c0d1b827149565da34b3383e5306f7f'; Destination=(Join-Path $sdk 'system-images/android-35/default')}
}
$chunkSize = 8MB
$jobs = @()
foreach ($package in $packages) {
    $parts = Join-Path $downloads ($package.Name + '.parts')
    New-Item -ItemType Directory -Force -Path $parts | Out-Null
    for ($start = 0L; $start -lt $package.Size; $start += $chunkSize) {
        $end = [Math]::Min($package.Size - 1, $start + $chunkSize - 1)
        $part = Join-Path $parts (('{0:D4}' -f [int]($start / $chunkSize)) + '.part')
        $jobs += @{Url=$package.Url; Start=$start; End=$end; Size=($end - $start + 1); Path=$part}
    }
}
Write-Output "Downloading $($jobs.Count) official archive ranges using $ParallelDownloads connections."
$jobs | ForEach-Object -Parallel {
    $ErrorActionPreference = 'Stop'
    $PSNativeCommandUseErrorActionPreference = $false
    $job = $_
    if ((Test-Path -LiteralPath $job.Path) -and (Get-Item -LiteralPath $job.Path).Length -eq $job.Size) { return }
    $tail = $job.Path + '.tail'
    $headers = $job.Path + '.headers'
    $curlLog = $job.Path + '.curl.log'
    # A stopped previous run may have a useful, unmerged tail.
    $received = if (Test-Path -LiteralPath $job.Path) { (Get-Item -LiteralPath $job.Path).Length } else { 0L }
    $offset = $job.Start + $received
    if ((Test-Path -LiteralPath $headers) -and (Test-Path -LiteralPath $tail)) {
        $response = Get-Content -LiteralPath $headers -Raw
        $length = (Get-Item -LiteralPath $tail).Length
        if ($response -match "(?im)^content-range:\s*bytes\s+$offset-\d+/\d+\s*$" -and $length -gt 0 -and $length -le ($job.Size - $received)) {
            $output = [IO.File]::Open($job.Path, [IO.FileMode]::Append, [IO.FileAccess]::Write)
            $input = [IO.File]::OpenRead($tail)
            try { $input.CopyTo($output) } finally { $input.Dispose(); $output.Dispose() }
        }
    }
    # Preserve received bytes after a connection failure. Only append a verified
    # HTTP range response, so an HTML error page cannot become an archive part.
    for ($attempt = 0; $attempt -lt 12; $attempt++) {
        $received = if (Test-Path -LiteralPath $job.Path) { (Get-Item -LiteralPath $job.Path).Length } else { 0L }
        if ($received -eq $job.Size) { break }
        if ($received -gt $job.Size) { throw "Oversized range: $($job.Path)" }
        $offset = $job.Start + $received
        $range = "$offset-$($job.End)"
        & curl.exe -fL --connect-timeout 15 --max-time 120 --speed-limit 1024 --speed-time 45 --silent --show-error --range $range --max-filesize ($job.Size - $received) --dump-header $headers $job.Url -o $tail 2> $curlLog
        if ((Test-Path -LiteralPath $headers) -and (Test-Path -LiteralPath $tail)) {
            $response = Get-Content -LiteralPath $headers -Raw
            $length = (Get-Item -LiteralPath $tail).Length
            if ($response -match "(?im)^content-range:\s*bytes\s+$offset-\d+/\d+\s*$" -and $length -gt 0 -and $length -le ($job.Size - $received)) {
                $output = [IO.File]::Open($job.Path, [IO.FileMode]::Append, [IO.FileAccess]::Write)
                $input = [IO.File]::OpenRead($tail)
                try { $input.CopyTo($output) } finally { $input.Dispose(); $output.Dispose() }
            }
        }
    }
    if (-not (Test-Path -LiteralPath $job.Path) -or (Get-Item -LiteralPath $job.Path).Length -ne $job.Size) { throw "Range download incomplete (safe to resume): $($job.Path)" }
    Write-Output "Range complete: $($job.Path)"
} -ThrottleLimit $ParallelDownloads
foreach ($package in $packages) {
    $archive = Join-Path $downloads ($package.Name + '.zip')
    $partFiles = Get-ChildItem -LiteralPath (Join-Path $downloads ($package.Name + '.parts')) -Filter '*.part' -File | Sort-Object Name
    $output = [IO.File]::Open($archive, [IO.FileMode]::Create, [IO.FileAccess]::Write)
    try {
        foreach ($part in $partFiles) {
            $input = [IO.File]::OpenRead($part.FullName)
            try { $input.CopyTo($output) } finally { $input.Dispose() }
        }
    } finally { $output.Dispose() }
    if ((Get-FileHash -LiteralPath $archive -Algorithm SHA1).Hash -ne $package.Sha1) { throw "Official checksum mismatch: $archive" }
    New-Item -ItemType Directory -Force -Path $package.Destination | Out-Null
    Expand-Archive -LiteralPath $archive -DestinationPath $package.Destination -Force
    Write-Output "Verified and extracted: $($package.Name)"
}
Write-Output "Android emulator runtime ready at $sdk"
