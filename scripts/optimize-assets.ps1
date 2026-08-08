param(
    [int]$LandscapeMaxSize = 1920,
    [int]$JpegQuality = 82,
    [switch]$SkipLandscapes
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$publicRoot = Join-Path $projectRoot 'public'
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object MimeType -eq 'image/jpeg'

function New-ResizedBitmap {
    param(
        [System.Drawing.Image]$Source,
        [int]$Width,
        [int]$Height
    )

    $target = [System.Drawing.Bitmap]::new($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($target)
    try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($Source, 0, 0, $Width, $Height)
    }
    finally {
        $graphics.Dispose()
    }
    return $target
}

function Save-Jpeg {
    param(
        [System.Drawing.Image]$Image,
        [string]$Path,
        [int]$Quality
    )

    $qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
    $encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
        $qualityEncoder,
        [long]$Quality
    )
    try {
        $Image.Save($Path, $jpegCodec, $encoderParameters)
    }
    finally {
        $encoderParameters.Dispose()
    }
}

function Optimize-Jpeg {
    param(
        [string]$Path,
        [int]$MaxSize,
        [int]$Quality
    )

    $source = [System.Drawing.Image]::FromFile($Path)
    try {
        $largestDimension = [double][Math]::Max($source.Width, $source.Height)
        $scale = [Math]::Min([double]1, [double]$MaxSize / $largestDimension)
        $width = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))
        $target = New-ResizedBitmap -Source $source -Width $width -Height $height
        try {
            $temporaryPath = "$Path.optimized"
            Save-Jpeg -Image $target -Path $temporaryPath -Quality $Quality
        }
        finally {
            $target.Dispose()
        }
    }
    finally {
        $source.Dispose()
    }
    Move-Item -LiteralPath "$Path.optimized" -Destination $Path -Force
}

$iconSourcePath = Join-Path $publicRoot 'icon-512.png'
$loadedIcon = [System.Drawing.Image]::FromFile($iconSourcePath)
$iconSource = [System.Drawing.Bitmap]::new($loadedIcon)
$loadedIcon.Dispose()

try {
    foreach ($icon in @(
        @{ Name = 'icon-192.png'; Size = 192 },
        @{ Name = 'icon-512.png'; Size = 512 },
        @{ Name = 'apple-touch-icon.png'; Size = 180 }
    )) {
        $resizedIcon = New-ResizedBitmap -Source $iconSource -Width $icon.Size -Height $icon.Size
        try {
            $resizedIcon.Save(
                (Join-Path $publicRoot $icon.Name),
                [System.Drawing.Imaging.ImageFormat]::Png
            )
        }
        finally {
            $resizedIcon.Dispose()
        }
    }

    $socialPreview = [System.Drawing.Bitmap]::new(1200, 630)
    $graphics = [System.Drawing.Graphics]::FromImage($socialPreview)
    try {
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
        $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
            [System.Drawing.Rectangle]::new(0, 0, 1200, 630),
            [System.Drawing.Color]::FromArgb(8, 22, 38),
            [System.Drawing.Color]::FromArgb(21, 94, 117),
            18
        )
        $graphics.FillRectangle($background, 0, 0, 1200, 630)
        $background.Dispose()

        $accent = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(38, 94, 234, 212))
        $graphics.FillEllipse($accent, -130, 330, 520, 520)
        $graphics.FillEllipse($accent, 900, -180, 480, 480)
        $accent.Dispose()

        $graphics.DrawImage($iconSource, 705, 65, 500, 500)
        $titleFont = [System.Drawing.Font]::new('Segoe UI', 66, [System.Drawing.FontStyle]::Bold)
        $blogFont = [System.Drawing.Font]::new('Segoe UI', 54, [System.Drawing.FontStyle]::Bold)
        $subtitleFont = [System.Drawing.Font]::new('Segoe UI', 25, [System.Drawing.FontStyle]::Regular)
        $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
        $muted = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220, 219, 234, 240))
        try {
            $graphics.DrawString('ПГКНМА', $titleFont, $white, 70, 150)
            $graphics.DrawString('БЛОГ', $blogFont, $white, 70, 235)
            $graphics.DrawString('Новини и събития от', $subtitleFont, $muted, 75, 355)
            $graphics.DrawString('училищния живот', $subtitleFont, $muted, 75, 395)
        }
        finally {
            $titleFont.Dispose()
            $blogFont.Dispose()
            $subtitleFont.Dispose()
            $white.Dispose()
            $muted.Dispose()
        }
        Save-Jpeg -Image $socialPreview -Path (Join-Path $publicRoot 'social-preview.jpg') -Quality 90
    }
    finally {
        $graphics.Dispose()
        $socialPreview.Dispose()
    }
}
finally {
    $iconSource.Dispose()
}

if (-not $SkipLandscapes) {
    Get-ChildItem -LiteralPath (Join-Path $publicRoot 'Landscape') -Filter '*.jpg' -File |
        ForEach-Object { Optimize-Jpeg -Path $_.FullName -MaxSize $LandscapeMaxSize -Quality $JpegQuality }
}

Optimize-Jpeg `
    -Path (Join-Path $publicRoot 'Prof_Minko_Balkanski.jpg') `
    -MaxSize 1200 `
    -Quality $JpegQuality

Write-Host 'Static image assets optimized successfully.'
