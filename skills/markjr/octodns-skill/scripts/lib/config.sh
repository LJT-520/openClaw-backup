#!/usr/bin/env bash
# Helper functions for reading agent configuration

get_default_provider() {
    local config_file="${1:-.agent-config.json}"
    
    if [ ! -f "$config_file" ]; then
        echo "easydns"  # Fallback default
        return
    fi
    
    python3 -c "import json; print(json.load(open('$config_file'))['default_provider'])" 2>/dev/null || echo "easydns"
}

get_credentials_path() {
    local config_file="${1:-.agent-config.json}"
    
    if [ ! -f "$config_file" ]; then
        echo "/Users/markjr/clawd/.credentials"  # Fallback default
        return
    fi
    
    python3 -c "import json; print(json.load(open('$config_file'))['credentials_path'])" 2>/dev/null || echo "/Users/markjr/clawd/.credentials"
}

load_provider_credentials() {
    local provider="$1"
    local config_file="${2:-.agent-config.json}"
    
    local creds_path=$(get_credentials_path "$config_file")
    local creds_file="${creds_path}/${provider}.json"
    
    if [ ! -f "$creds_file" ]; then
        echo "Error: Credentials file not found: $creds_file"
        echo "Run: ./scripts/setup.sh"
        return 1
    fi
    
    # Load credentials based on provider
    if [ "$provider" = "easydns" ]; then
        export EASYDNS_TOKEN=$(python3 -c "import json; print(json.load(open('$creds_file'))['api_token'])")
        export EASYDNS_API_KEY=$(python3 -c "import json; print(json.load(open('$creds_file'))['api_key'])")
        export EASYDNS_PORTFOLIO=$(python3 -c "import json; print(json.load(open('$creds_file'))['portfolio'])")
    elif [ "$provider" = "route53" ]; then
        export AWS_ACCESS_KEY_ID=$(python3 -c "import json; print(json.load(open('$creds_file'))['access_key_id'])")
        export AWS_SECRET_ACCESS_KEY=$(python3 -c "import json; print(json.load(open('$creds_file'))['secret_access_key'])")
    elif [ "$provider" = "cloudflare" ]; then
        export CLOUDFLARE_TOKEN=$(python3 -c "import json; print(json.load(open('$creds_file'))['token'])")
    fi
    
    echo "✓ Loaded credentials for $provider"
}
