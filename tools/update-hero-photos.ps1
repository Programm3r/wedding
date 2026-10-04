# Makes fast, web-sized copies of the landing page photos (originals are untouched):
#   images/images/IMG_20251018_182633.jpg  ->  images/hero.jpg          (the page background)
#   images/tiles/13.*, 14.*, 15.*           ->  images/tiles/web/13.jpg  (the photos on the date tiles)
#
# Usage (from the project folder):
#   powershell -ExecutionPolicy Bypass -File tools\update-hero-photos.ps1
#
# To change a tile photo, drop the new one into images/tiles/ named after its date and re-run.

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }

function Save-WebCopy($source, $target, $maxSize, [long]$q) {
  $quality = New-Object System.Drawing.Imaging.EncoderParameters 1
  $quality.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $q
  $img = [System.Drawing.Image]::FromFile($source)
  try {
    # Apply the phone's EXIF rotation so portrait photos stay upright
    if ($img.PropertyIdList -contains 0x0112) {
      switch ($img.GetPropertyItem(0x0112).Value[0]) {
        3 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
        6 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
        8 { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }
      }
    }
    $scale = [Math]::Min([double]1, [double]$maxSize / [Math]::Max($img.Width, $img.Height))
    $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose()
    $bmp.Save($target, $jpegCodec, $quality)
    $bmp.Dispose()
  } finally { $img.Dispose() }
  Write-Host ("{0}  {1}x{2}  {3:N0} KB" -f (Resolve-Path -Relative $target), $w, $h, ((Get-Item $target).Length / 1KB))
}

Push-Location $root
try {
  Save-WebCopy (Join-Path $root "images\images\IMG_20251018_182633.jpg") (Join-Path $root "images\hero.jpg") 2000 70  # sits under a dark overlay, so it can be lighter

  $webDir = Join-Path $root "images\tiles\web"
  New-Item -ItemType Directory -Force $webDir | Out-Null
  foreach ($day in 13, 14, 15) {
    $photo = Get-ChildItem (Join-Path $root "images\tiles") -File | Where-Object { $_.BaseName -eq "$day" } | Select-Object -First 1
    if (-not $photo) { throw "No photo for the $day in images\tiles (expected $day.jpg)" }
    Save-WebCopy $photo.FullName (Join-Path $webDir "$day.jpg") 720 80
  }
} finally { Pop-Location }
