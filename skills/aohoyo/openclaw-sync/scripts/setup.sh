#!/bin/bash

# OpenClaw 数据同步 - 配置向导
# 交互式配置云存储和同步模式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$SKILL_DIR/config"
DATA_DIR="$SKILL_DIR/data"
WORKSPACE_DIR="/home/node/.openclaw/workspace"

# 配置文件
RCLONE_CONF="$CONFIG_DIR/rclone.conf"
BACKUP_CONF="$CONFIG_DIR/backup.json"

# 打印标题
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║   OpenClaw 数据同步 - 配置向导           ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

# 检查 rclone 是否安装
check_rclone() {
    if ! command -v rclone &> /dev/null; then
        echo -e "${YELLOW}⚠️  rclone 未安装${NC}"
        echo ""
        echo "请先安装 rclone："
        echo "  curl https://rclone.org/install.sh | sudo bash"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ rclone 已安装: $(rclone version | head -1)${NC}"
}

# 检测已安装的云存储技能
detect_cloud_skills() {
    echo -e "${BLUE}检测已安装的云存储技能...${NC}"
    echo ""

    local skills=()
    local skill_paths=(
        "$WORKSPACE_DIR/skills/tencent-cos-skill-*"
        "$WORKSPACE_DIR/skills/qiniu-kodo"
        "$WORKSPACE_DIR/skills/aliyun-oss-skill"
    )

    for pattern in "${skill_paths[@]}"; do
        for skill_path in $pattern; do
            if [ -d "$skill_path" ]; then
                local skill_name=$(basename "$skill_path")
                skills+=("$skill_name")
                echo -e "  ${GREEN}✓${NC} $skill_name"
            fi
        done
    done

    if [ ${#skills[@]} -eq 0 ]; then
        echo -e "${YELLOW}未检测到云存储技能${NC}"
        echo ""
        return 1
    fi

    echo ""
    CLOUD_SKILLS=("${skills[@]}")
    return 0
}

# 选择云服务商
select_provider() {
    echo -e "${BLUE}请选择云存储服务商：${NC}"
    echo ""
    echo "1) 腾讯云 COS"
    echo "   - 6个月免费 50GB"
    echo "   - 配置简单，界面友好"
    echo ""
    echo "2) 七牛云 Kodo"
    echo "   - 每月免费 10GB"
    echo "   - 免费额度大"
    echo ""
    echo "3) 阿里云 OSS"
    echo "   - 稳定性高，企业级"
    echo "   - 按量付费"
    echo ""
    echo "4) 手动配置（其他云存储）"
    echo ""

    read -p "请输入选择 (1-4): " choice

    case $choice in
        1)
            PROVIDER="tencent"
            PROVIDER_NAME="腾讯云 COS"
            ;;
        2)
            PROVIDER="qiniu"
            PROVIDER_NAME="七牛云 Kodo"
            ;;
        3)
            PROVIDER="aliyun"
            PROVIDER_NAME="阿里云 OSS"
            ;;
        4)
            PROVIDER="custom"
            PROVIDER_NAME="自定义"
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}✅ 已选择：$PROVIDER_NAME${NC}"
    echo ""
}

# 从现有技能读取配置
read_existing_config() {
    local provider=$1
    local config_found=false

    case $provider in
        tencent)
            # 尝试从腾讯云技能读取配置
            local tencent_skill=$(find "$WORKSPACE_DIR/skills" -name "tencent-cos-skill-*" -type d | head -1)
            if [ -n "$tencent_skill" ] && [ -f "$tencent_skill/_meta.json" ]; then
                echo -e "${BLUE}发现腾讯云 COS 技能配置${NC}"
                # 这里可以解析 _meta.json 或其他配置文件
                # 简化起见，让用户手动输入
                config_found=true
            fi
            ;;
        qiniu)
            # 尝试从七牛云技能读取配置
            if [ -d "$WORKSPACE_DIR/skills/qiniu-kodo" ]; then
                echo -e "${BLUE}发现七牛云 Kodo 技能配置${NC}"
                config_found=true
            fi
            ;;
        aliyun)
            # 尝试从阿里云技能读取配置
            if [ -d "$WORKSPACE_DIR/skills/aliyun-oss-skill" ]; then
                echo -e "${BLUE}发现阿里云 OSS 技能配置${NC}"
                config_found=true
            fi
            ;;
    esac

    return 0
}

# 配置云存储密钥
configure_credentials() {
    echo -e "${BLUE}配置 $PROVIDER_NAME 访问密钥${NC}"
    echo ""

    case $PROVIDER in
        tencent)
            echo "请前往腾讯云控制台获取密钥："
            echo "https://console.cloud.tencent.com/cam/capi"
            echo ""
            read -p "请输入 SecretId: " access_key
            read -p "请输入 SecretKey: " secret_key
            read -p "请输入 Bucket 名称 (格式: bucket-appid): " bucket
            read -p "请输入 Region (默认: ap-shanghai): " region
            region=${region:-ap-shanghai}
            ;;

        qiniu)
            echo "请前往七牛云控制台获取密钥："
            echo "https://portal.qiniu.com/user/key"
            echo ""
            read -p "请输入 AccessKey: " access_key
            read -p "请输入 SecretKey: " secret_key
            read -p "请输入 Bucket 名称: " bucket
            read -p "请输入 Region (默认: z0): " region
            region=${region:-z0}
            ;;

        aliyun)
            echo "请前往阿里云控制台获取密钥："
            echo "https://ram.console.aliyun.com/manage/ak"
            echo ""
            read -p "请输入 AccessKey ID: " access_key
            read -p "请输入 AccessKey Secret: " secret_key
            read -p "请输入 Bucket 名称: " bucket
            read -p "请输入 Region (默认: oss-cn-shanghai): " region
            region=${region:-oss-cn-shanghai}
            ;;

        custom)
            echo -e "${YELLOW}手动配置模式${NC}"
            echo ""
            read -p "请输入 rclone remote 名称: " remote_name
            read -p "请输入 Access Key: " access_key
            read -p "请输入 Secret Key: " secret_key
            read -p "请输入 Bucket 名称: " bucket
            read -p "请输入 Endpoint: " endpoint
            ;;
    esac

    echo ""
    echo -e "${GREEN}✅ 配置信息已收集${NC}"
}

# 配置实例名称和目录前缀
configure_prefix() {
    echo ""
    echo -e "${BLUE}配置实例名称（用于区分多个 OpenClaw 实例）${NC}"
    echo ""
    echo "如果你有多个 OpenClaw 服务器，可以为每个实例设置不同的名称。"
    echo "数据会存储在：bucket/<实例名称>/ 目录下"
    echo ""
    echo "示例："
    echo "  - main（主服务器）"
    echo "  - dev（开发服务器）"
    echo "  - 烧烤店（业务服务器）"
    echo "  - 服务器主机名（自动）"
    echo ""

    # 默认使用主机名
    local default_name=$(hostname | cut -d. -f1)
    read -p "请输入实例名称 (默认: $default_name): " instance_name
    instance_name=${instance_name:-$default_name}

    # 生成前缀
    PREFIX="$instance_name/"
    INSTANCE_NAME="$instance_name"

    echo ""
    echo -e "${GREEN}✅ 实例名称: $INSTANCE_NAME${NC}"
    echo -e "${GREEN}✅ 云端目录: bucket/$PREFIX${NC}"
}

# 生成 rclone 配置
generate_rclone_config() {
    echo -e "${BLUE}生成 rclone 配置...${NC}"

    mkdir -p "$CONFIG_DIR"

    local remote_name="openclaw-backup"

    case $PROVIDER in
        tencent)
            cat > "$RCLONE_CONF" <<EOF
[$remote_name]
type = s3
provider = TencentCOS
env_auth = false
access_key_id = $access_key
secret_access_key = $secret_key
endpoint = cos.${region}.myqcloud.com
acl = private
EOF
            ;;

        qiniu)
            cat > "$RCLONE_CONF" <<EOF
[$remote_name]
type = qiniu
provider = Qiniu
env_auth = false
access_key_id = $access_key
secret_access_key = $secret_key
endpoint = https://storage.${region}.qiniu.com
EOF
            ;;

        aliyun)
            cat > "$RCLONE_CONF" <<EOF
[$remote_name]
type = s3
provider = AlibabaOSS
env_auth = false
access_key_id = $access_key
secret_access_key = $secret_key
endpoint = ${region}.aliyuncs.com
acl = private
EOF
            ;;

        custom)
            cat > "$RCLONE_CONF" <<EOF
[$remote_name]
type = s3
env_auth = false
access_key_id = $access_key
secret_access_key = $secret_key
endpoint = $endpoint
EOF
            ;;
    esac

    chmod 600 "$RCLONE_CONF"
    echo -e "${GREEN}✅ rclone 配置已生成: $RCLONE_CONF${NC}"

    # 保存 bucket 和 remote 到配置文件
    cat > "$BACKUP_CONF" <<EOF
{
  "version": "1.0.0",
  "provider": "$PROVIDER",
  "providerName": "$PROVIDER_NAME",
  "remoteName": "$remote_name",
  "bucket": "$bucket",
  "region": "$region",
  "prefix": "$PREFIX",
  "instanceName": "$INSTANCE_NAME",
  "workspaceDir": "$WORKSPACE_DIR",
  "syncList": "$DATA_DIR/sync-list.txt",
  "syncMode": "$SYNC_MODE",
  "createdAt": "$(date -Iseconds)",
  "updatedAt": "$(date -Iseconds)"
}
EOF

    chmod 600 "$BACKUP_CONF"
    echo -e "${GREEN}✅ 备份配置已生成: $BACKUP_CONF${NC}"
}

# 测试连接
test_connection() {
    echo ""
    read -p "是否立即测试连接？ (y/n): " test_now

    if [ "$test_now" = "y" ] || [ "$test_now" = "Y" ]; then
        echo -e "${BLUE}测试云存储连接...${NC}"

        local remote_name="openclaw-backup"
        local test_result

        # 尝试列出 bucket
        if rclone ls "$remote_name:$bucket" --config "$RCLONE_CONF" --max-depth 1 2>&1; then
            echo -e "${GREEN}✅ 连接成功！${NC}"
        else
            echo -e "${YELLOW}⚠️  连接测试失败，请检查配置${NC}"
            read -p "是否继续配置？ (y/n): " continue_setup
            if [ "$continue_setup" != "y" ] && [ "$continue_setup" != "Y" ]; then
                exit 1
            fi
        fi
    fi
}

# 选择同步模式
select_sync_mode() {
    echo ""
    echo -e "${BLUE}请选择同步模式：${NC}"
    echo ""
    echo "1) 实时同步（推荐）- 文件修改后自动同步"
    echo "2) 定时同步 - 每天固定时间同步"
    echo "3) 手动同步 - 需要时手动触发"
    echo ""

    read -p "请输入选择 (1-3): " mode_choice

    case $mode_choice in
        1)
            SYNC_MODE="realtime"
            echo -e "${GREEN}✅ 已选择：实时同步${NC}"
            ;;
        2)
            SYNC_MODE="scheduled"
            echo -e "${GREEN}✅ 已选择：定时同步${NC}"
            ;;
        3)
            SYNC_MODE="manual"
            echo -e "${GREEN}✅ 已选择：手动同步${NC}"
            ;;
        *)
            echo -e "${RED}无效选择，使用手动同步${NC}"
            SYNC_MODE="manual"
            ;;
    esac
}

# 配置定时任务
setup_cron() {
    if [ "$SYNC_MODE" = "scheduled" ]; then
        echo ""
        echo -e "${BLUE}配置定时同步任务${NC}"
        echo ""
        echo "请选择同步频率："
        echo "1) 每天凌晨 3 点"
        echo "2) 每天凌晨 4 点"
        echo "3) 每周日凌晨 3 点"
        echo "4) 自定义 cron 表达式"
        echo ""

        read -p "请输入选择 (1-4): " cron_choice

        local cron_expr
        case $cron_choice in
            1) cron_expr="0 3 * * *" ;;
            2) cron_expr="0 4 * * *" ;;
            3) cron_expr="0 3 * * 0" ;;
            4)
                read -p "请输入 cron 表达式: " cron_expr
                ;;
            *)
                cron_expr="0 3 * * *"
                ;;
        esac

        # 添加到 crontab
        (crontab -l 2>/dev/null; echo "$cron_expr $SCRIPT_DIR/sync-now.sh >> /var/log/openclaw-sync.log 2>&1") | crontab -

        echo -e "${GREEN}✅ 定时任务已添加${NC}"
        echo -e "   Cron: $cron_expr"
    fi
}

# 配置实时同步服务
setup_realtime_sync() {
    if [ "$SYNC_MODE" = "realtime" ]; then
        echo ""
        echo -e "${BLUE}配置实时同步服务...${NC}"

        # 生成 systemd 服务文件
        local service_file="$SKILL_DIR/systemd/openclaw-sync.service"

        cat > "$service_file" <<EOF
[Unit]
Description=OpenClaw Data Sync Service
After=network.target

[Service]
Type=simple
User=node
WorkingDirectory=$SKILL_DIR
ExecStart=/usr/bin/rclone sync $WORKSPACE_DIR/ openclaw-backup:$bucket/$PREFIX \\
  --include-from $DATA_DIR/sync-list.txt \\
  --config $RCLONE_CONF \\
  --log-file /var/log/openclaw-sync.log \\
  --log-level INFO \\
  --verbose
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

        echo -e "${GREEN}✅ systemd 服务文件已生成${NC}"
        echo ""
        echo "启动服务："
        echo "  sudo cp $service_file /etc/systemd/system/"
        echo "  sudo systemctl daemon-reload"
        echo "  sudo systemctl enable openclaw-sync"
        echo "  sudo systemctl start openclaw-sync"
    fi
}

# 完成配置
finish_setup() {
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        配置完成！                        ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo "配置信息："
    echo "  - 云服务商: $PROVIDER_NAME"
    echo "  - Bucket: $bucket"
    echo "  - Region: $region"
    echo "  - 实例名称: $INSTANCE_NAME"
    echo "  - 云端目录: bucket/$PREFIX"
    echo "  - 同步模式: $SYNC_MODE"
    echo ""
    echo "配置文件："
    echo "  - rclone 配置: $RCLONE_CONF"
    echo "  - 备份配置: $BACKUP_CONF"
    echo "  - 同步列表: $DATA_DIR/sync-list.txt"
    echo ""
    echo "使用方法："
    echo "  - 立即同步: bash $SCRIPT_DIR/sync-now.sh"
    echo "  - 查看云端: bash $SCRIPT_DIR/list-remote.sh"
    echo "  - 恢复数据: bash $SCRIPT_DIR/restore.sh"
    echo ""

    if [ "$SYNC_MODE" = "manual" ]; then
        echo "💡 提示：你可以随时运行 bash $SCRIPT_DIR/sync-now.sh 手动同步"
    fi

    echo ""
    read -p "是否立即执行一次同步？ (y/n): " sync_now
    if [ "$sync_now" = "y" ] || [ "$sync_now" = "Y" ]; then
        bash "$SCRIPT_DIR/sync-now.sh"
    fi
}

# 主流程
main() {
    print_header
    check_rclone
    detect_cloud_skills
    select_provider
    read_existing_config "$PROVIDER"
    configure_credentials
    configure_prefix
    generate_rclone_config
    test_connection
    select_sync_mode
    setup_cron
    setup_realtime_sync
    finish_setup
}

# 运行
main
