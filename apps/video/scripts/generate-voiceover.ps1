param(
  [string]$Voice = 'en-US-AvaMultilingualNeural',
  [string]$Rate = '+15%'
)

$videoRoot = Split-Path -Parent $PSScriptRoot
$voiceTool = Join-Path $videoRoot '.venv\Scripts\edge-tts.exe'
if (-not (Test-Path -LiteralPath $voiceTool)) {
  throw 'Create apps/video/.venv with Python 3.12+, then install scripts/requirements.txt.'
}

$narration = Join-Path $PSScriptRoot 'narration.txt'
$output = Join-Path $videoRoot 'public\voiceover\loci-loom.mp3'
$subtitles = Join-Path $videoRoot 'public\voiceover\loci-loom.vtt'
& $voiceTool --voice $Voice --rate $Rate --file $narration --write-media $output --write-subtitles $subtitles
if ($LASTEXITCODE -ne 0) { throw 'Voiceover generation failed.' }
