#!/bin/bash

# Elijah's Whirlwind Plugin Installation Script
# This script helps install Elijah's Whirlwind Plugin for Minecraft

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Elijah's Whirlwind Plugin Installation Script${NC}"
echo "======================================"
echo ""

# Check if plugin file exists
if [ ! -f "ElijahsWhirlwindPlugin.js" ]; then
    echo -e "${RED}Error: ElijahsWhirlwindPlugin.js not found in current directory${NC}"
    exit 1
fi

# Detect OS and default server directories
OS="$(uname -s)"
DEFAULT_DIRS=()

if [ "$OS" = "Darwin" ]; then
    # macOS default directories
    DEFAULT_DIRS=(
        "$HOME/Desktop/minecraft-server"
        "$HOME/Documents/minecraft-server"
        "$HOME/Desktop/server"
        "$HOME/Documents/server"
        "$HOME/minecraft-server"
        "$HOME/server"
    )
elif [ "$OS" = "Linux" ]; then
    # Linux default directories
    DEFAULT_DIRS=(
        "$HOME/minecraft-server"
        "$HOME/server"
        "/opt/minecraft-server"
        "/srv/minecraft-server"
    )
else
    # Windows (Git Bash) or other
    DEFAULT_DIRS=(
        "$HOME/minecraft-server"
        "$HOME/server"
    )
fi

# Try to find an existing server directory
SERVER_DIR=""
for dir in "${DEFAULT_DIRS[@]}"; do
    if [ -d "$dir" ] && [ -d "$dir/plugins" ]; then
        SERVER_DIR="$dir"
        echo -e "${GREEN}Found server directory: $SERVER_DIR${NC}"
        break
    fi
done

# If no server directory found, ask user or try first default
if [ -z "$SERVER_DIR" ]; then
    echo "Detecting JavaScript plugin framework..."
    echo ""
    echo "Common server directories checked: ${DEFAULT_DIRS[0]}"
    echo "Tip: On macOS, you can drag a folder from Finder into Terminal to get its path"
    read -p "Enter your Minecraft server directory path (or press Enter for ${DEFAULT_DIRS[0]}): " SERVER_DIR
    
    # Use first default if empty
    if [ -z "$SERVER_DIR" ]; then
        SERVER_DIR="${DEFAULT_DIRS[0]}"
        echo -e "${YELLOW}Using default: $SERVER_DIR${NC}"
    fi
else
    echo "Detecting JavaScript plugin framework..."
    echo ""
fi

if [ ! -d "$SERVER_DIR" ]; then
    echo -e "${RED}Error: Directory '$SERVER_DIR' does not exist${NC}"
    echo -e "${YELLOW}Please create the directory or provide a different path${NC}"
    exit 1
fi

# Check for plugins directory
PLUGINS_DIR="$SERVER_DIR/plugins"
if [ ! -d "$PLUGINS_DIR" ]; then
    echo -e "${YELLOW}Warning: plugins directory not found. Creating it...${NC}"
    mkdir -p "$PLUGINS_DIR"
fi

# Try to detect framework
if [ -d "$PLUGINS_DIR/scriptcraft" ]; then
    FRAMEWORK="scriptcraft"
    TARGET_DIR="$PLUGINS_DIR/scriptcraft/plugins"
    echo -e "${GREEN}Detected: ScriptCraft${NC}"
elif [ -d "$PLUGINS_DIR/SpigotJS" ]; then
    FRAMEWORK="spigotjs"
    TARGET_DIR="$PLUGINS_DIR/SpigotJS/plugins"
    echo -e "${GREEN}Detected: SpigotJS${NC}"
else
    # Ask user to choose
    echo "No JavaScript framework detected. Which framework are you using?"
    echo "1) ScriptCraft"
    echo "2) SpigotJS"
    echo "3) Other (manual installation)"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            FRAMEWORK="scriptcraft"
            TARGET_DIR="$PLUGINS_DIR/scriptcraft/plugins"
            mkdir -p "$TARGET_DIR"
            ;;
        2)
            FRAMEWORK="spigotjs"
            TARGET_DIR="$PLUGINS_DIR/SpigotJS/plugins"
            mkdir -p "$TARGET_DIR"
            ;;
        3)
            echo -e "${YELLOW}Manual installation required.${NC}"
            echo "Please copy ElijahsWhirlwindPlugin.js to your JavaScript plugin framework's plugins directory."
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
fi

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}Creating directory: $TARGET_DIR${NC}"
    mkdir -p "$TARGET_DIR"
fi

# Copy plugin file
echo ""
echo "Installing plugin..."
cp "ElijahsWhirlwindPlugin.js" "$TARGET_DIR/"
echo -e "${GREEN}✓ Plugin installed to: $TARGET_DIR/ElijahsWhirlwindPlugin.js${NC}"

# Check if plugin.yml should be copied (for some frameworks)
if [ -f "plugin.yml" ]; then
    echo -e "${YELLOW}Note: plugin.yml found. Some frameworks may require it in a different location.${NC}"
fi

echo ""
echo -e "${GREEN}Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart your Minecraft server, or"
echo "2. If using ScriptCraft, run '/js refresh()' in-game to reload"
echo ""
echo "Test the plugin with: /whirlwind list"
