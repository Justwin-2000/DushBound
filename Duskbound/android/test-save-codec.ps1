[CmdletBinding()]
param([string]$ToolingRoot = (Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.tooling'))
$ErrorActionPreference = 'Stop'
$javac = Get-ChildItem -LiteralPath (Join-Path $ToolingRoot 'jdk17') -Filter 'javac.exe' -File -Recurse | Select-Object -First 1
if (-not $javac) { throw 'Run android/install-toolchain.ps1 first.' }
$java = Join-Path $javac.DirectoryName 'java.exe'
$output = Join-Path $PSScriptRoot 'build/codec-tests'
New-Item -ItemType Directory -Force -Path $output | Out-Null
& $javac.FullName -encoding UTF-8 -d $output (Join-Path $PSScriptRoot 'src/game/duskbound/embers/SaveFileCodec.java') (Join-Path $PSScriptRoot 'tests/game/duskbound/embers/SaveFileCodecTest.java')
if ($LASTEXITCODE -ne 0) { throw 'Native save codec test compilation failed.' }
& $java -cp $output game.duskbound.embers.SaveFileCodecTest
if ($LASTEXITCODE -ne 0) { throw 'Native save codec tests failed.' }
