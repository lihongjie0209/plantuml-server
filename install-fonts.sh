#!/bin/bash

# PlantUML Server 字体安装脚本
# 用于在 Linux 系统上安装中文字体

echo "🎨 PlantUML Server 中文字体安装脚本"
echo "=================================="

# 检查是否以 root 身份运行
if [[ $EUID -ne 0 ]]; then
   echo "❌ 此脚本需要 root 权限运行"
   echo "使用: sudo $0"
   exit 1
fi

# 更新包管理器
echo "📦 更新包管理器..."
apt-get update -qq

# 安装字体包
echo "🔤 安装中文字体包..."

# 安装 Noto 字体（开源）
apt-get install -y fonts-noto-cjk fonts-noto-cjk-extra

# 安装文泉驿字体（开源）
apt-get install -y fonts-wqy-microhei fonts-wqy-zenhei

# 安装思源字体（开源）
apt-get install -y fonts-noto-cjk

# 安装其他有用的字体
apt-get install -y fonts-arphic-ukai fonts-arphic-uming

# 刷新字体缓存
echo "🔄 刷新字体缓存..."
fc-cache -fv

echo "✅ 字体安装完成！"
echo ""
echo "📋 已安装的中文字体："
echo "- Noto Sans CJK (支持中日韩)"
echo "- WenQuanYi Micro Hei (文泉驿微米黑)"
echo "- WenQuanYi Zen Hei (文泉驿正黑)"
echo "- AR PL UKai (文鼎 PL 中楷)"
echo "- AR PL UMing (文鼎 PL 细上海宋)"
echo ""
echo "🚀 重启 PlantUML Server 以应用字体更改"

# 列出可用的中文字体
echo ""
echo "🔍 可用的中文字体："
fc-list :lang=zh-cn family | sort | uniq
