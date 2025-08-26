# PlantUML Server 字体安装脚本 (Windows)
# 用于在 Windows 系统上检查和提醒字体安装

Write-Host "🎨 PlantUML Server 中文字体检查脚本" -ForegroundColor Cyan
Write-Host "=================================="

# 检查常见的中文字体
$commonFonts = @(
    "Microsoft YaHei",
    "SimSun", 
    "SimHei",
    "KaiTi",
    "Microsoft JhengHei"
)

Write-Host "🔍 检查系统中文字体..." -ForegroundColor Yellow

$installedFonts = @()
$missingFonts = @()

foreach ($font in $commonFonts) {
    $fontPath = "$env:WINDIR\Fonts\$font*"
    if (Test-Path $fontPath) {
        $installedFonts += $font
        Write-Host "✅ $font - 已安装" -ForegroundColor Green
    } else {
        $missingFonts += $font
        Write-Host "❌ $font - 未找到" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 安装状态:" -ForegroundColor Cyan
Write-Host "已安装字体: $($installedFonts.Count)" -ForegroundColor Green
Write-Host "缺失字体: $($missingFonts.Count)" -ForegroundColor Red

if ($missingFonts.Count -gt 0) {
    Write-Host ""
    Write-Host "📋 建议安装的字体:" -ForegroundColor Yellow
    foreach ($font in $missingFonts) {
        Write-Host "  - $font"
    }
}

Write-Host ""
Write-Host "💡 字体安装建议:" -ForegroundColor Cyan
Write-Host "1. Windows 系统通常已包含微软雅黑等中文字体"
Write-Host "2. 如需其他字体，请从以下位置获取:"
Write-Host "   - Microsoft 官方字体"
Write-Host "   - Google Noto Fonts (开源)"
Write-Host "   - Adobe Source Han Sans (开源)"
Write-Host ""
Write-Host "📁 将字体文件复制到项目的 fonts/ 目录"
Write-Host "🔄 重新构建 Docker 镜像以应用字体"

Write-Host ""
Write-Host "🚀 开源字体推荐:" -ForegroundColor Green
Write-Host "   Noto Sans CJK: https://fonts.google.com/noto/specimen/Noto+Sans+SC"
Write-Host "   Source Han Sans: https://github.com/adobe-fonts/source-han-sans"
