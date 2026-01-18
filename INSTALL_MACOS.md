# Elijah's Whirlwind - macOS Installation Guide

## Quick Installation on macOS

### Prerequisites

Before installing, make sure you have:
- A Minecraft server running on macOS (Spigot, Paper, or compatible)
- A JavaScript plugin framework installed (ScriptCraft or SpigotJS)
- Terminal access (built into macOS)

### Method 1: Automated Installation (Recommended)

1. **Open Terminal** (Applications > Utilities > Terminal, or press `Cmd + Space` and type "Terminal")

2. **Navigate to the plugin directory:**
   ```bash
   cd ~/Desktop/chaos/Whirlwind
   ```
   (Or wherever you saved the plugin files)

3. **Make the script executable** (if not already):
   ```bash
   chmod +x install.sh
   ```

4. **Run the installation script:**
   ```bash
   ./install.sh
   ```

5. **Follow the prompts:**
   - Enter your Minecraft server directory path when asked
   - Common macOS server locations:
     - `~/Desktop/minecraft-server`
     - `~/Documents/minecraft-server`
     - `/Applications/minecraft-server`
     - Or use Finder to drag-and-drop the folder path into Terminal

### Method 2: Manual Installation

#### For ScriptCraft Users

1. **Locate your server directory** (e.g., `~/Desktop/minecraft-server`)

2. **Copy the plugin file:**
   ```bash
   cp ~/Desktop/chaos/Whirlwind/ElijahsWhirlwindPlugin.js ~/Desktop/minecraft-server/plugins/scriptcraft/plugins/
   ```
   (Adjust paths to match your setup)

3. **Restart your server** or reload ScriptCraft with `/js refresh()` in-game

#### For SpigotJS Users

1. **Locate your server directory**

2. **Copy the plugin file:**
   ```bash
   cp ~/Desktop/chaos/Whirlwind/ElijahsWhirlwindPlugin.js ~/Desktop/minecraft-server/plugins/SpigotJS/plugins/
   ```

3. **Restart your Minecraft server**

### Common macOS Server Paths

If you're not sure where your server is located, try these common paths:

```bash
# Common desktop location
~/Desktop/minecraft-server

# Common documents location  
~/Documents/minecraft-server

# Application support (if using a launcher)
~/Library/Application\ Support/Minecraft/server
```

### Finding Your Server Directory

**Option 1: Using Finder**
1. Open Finder
2. Navigate to your server folder
3. Right-click the folder and select "Get Info"
4. Copy the path from "Where:" (press `Cmd + C` to copy)
5. Paste it into Terminal when prompted by the install script

**Option 2: Using Terminal**
1. Open Terminal
2. Type `cd ` (with a space)
3. Drag your server folder from Finder into Terminal
4. Press Enter
5. Type `pwd` to see the full path
6. Copy this path for use in the install script

### Verification

After installation:

1. **Start your Minecraft server** (if not already running)

2. **Check the console** for:
   ```
   Elijah's Whirlwind Plugin enabled! Chaos theory whirlwinds are active.
   ```

3. **Test in-game:**
   - Join your server
   - Type: `/whirlwind list`
   - Should show: `Active Whirlwinds: 0`

### Troubleshooting on macOS

**Script won't run?**
```bash
# Make sure it's executable
chmod +x install.sh

# Run with bash explicitly if needed
bash install.sh
```

**Permission denied?**
- macOS may require you to allow Terminal to run scripts
- Go to System Preferences > Security & Privacy > Allow Terminal

**Can't find server directory?**
- Use Finder to locate your server folder
- Drag the folder into Terminal to get the full path
- The path should start with `/Users/your-username/...`

**Plugin not loading?**
- Verify `ElijahsWhirlwindPlugin.js` is in the correct plugins subdirectory
- Check server console for JavaScript errors
- Make sure your JavaScript framework (ScriptCraft/SpigotJS) is installed

**Command not found errors?**
- Make sure you're in the correct directory
- Use `cd` to navigate to where you downloaded the plugin files
- Use `ls` to list files and verify `ElijahsWhirlwindPlugin.js` exists

### Quick Reference Commands

```bash
# Navigate to plugin directory
cd ~/Desktop/chaos/Whirlwind

# Make script executable
chmod +x install.sh

# Run installer
./install.sh

# Manual copy (ScriptCraft)
cp ElijahsWhirlwindPlugin.js ~/Desktop/minecraft-server/plugins/scriptcraft/plugins/

# Manual copy (SpigotJS)
cp ElijahsWhirlwindPlugin.js ~/Desktop/minecraft-server/plugins/SpigotJS/plugins/
```

### After Installation

Once installed, use these commands in-game:
- `/whirlwind spawn` - Spawn a whirlwind at your location
- `/whirlwind list` - List all active whirlwinds  
- `/whirlwind stop` - Stop all whirlwinds

Enjoy Elijah's Whirlwind on macOS! 🌪️
