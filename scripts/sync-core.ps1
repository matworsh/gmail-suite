$src = "E:\repos\gmail-suite\packages\core"
$apps = @(
  "E:\repos\gmail-suite\apps\flipinbox",
  "E:\repos\gmail-suite\apps\flipanalytics"
)
foreach ($app in $apps) {
  $dest = Join-Path $app "core"
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  Copy-Item -Path (Join-Path $src "*") -Destination $dest -Recurse -Force
}
Write-Output "Core synced to apps"
