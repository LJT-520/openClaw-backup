#!/bin/bash

# OpenClaw 数据同步 - 使用 qshell（七牛云官方工具）

echo "╔══════════════════════════════════════════╗"
echo "║   OpenClaw 数据同步                      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "由于 rclone 连接七牛云有问题，建议使用七牛云官方工具 qshell"
echo ""
echo "安装 qshell："
echo "  wget http://devtools.qiniu.com/qshell-linux-x64-v2.6.2.zip"
echo "  unzip qshell-linux-x64-v2.6.2.zip"
echo "  chmod +x qshell"
echo "  mv qshell ~/bin/"
echo ""
echo "配置 qshell："
echo "  ~/bin/qshell account OdMoSo_sCaIc7QflVG77NmsToQKbrnaN3m5CD7ZT GNE3dHUvd-PEsIgGwUWDwx1Ij5_R8Nmu5UcRDCiS silas-openclaw"
echo ""
echo "上传文件："
echo "  ~/bin/qshell rput silas-openclaw silas-nas-openclaw/MEMORY.md /home/node/.openclaw/workspace/MEMORY.md"
echo ""
