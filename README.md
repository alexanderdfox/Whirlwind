# Elijah's Whirlwind Plugin for Minecraft

A Minecraft plugin that generates realistic whirlwinds based on chaos theory and wind pattern algorithms.

## 🚀 Quick Installation

**Choose your installation method:**

### Option 1: Automated Installation (Recommended)
```bash
./install.sh
```
The installation script will guide you through the setup process.

### Option 2: Manual Installation
See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Quick Manual Steps:
1. Copy `ElijahsWhirlwindPlugin.js` to your JavaScript plugin framework's plugins directory
   - ScriptCraft: `plugins/scriptcraft/plugins/`
   - SpigotJS: `plugins/SpigotJS/plugins/`
2. Restart your server or reload scripts
3. Test with: `/whirlwind list`

## 📖 Documentation

- **[INSTALL.md](INSTALL.md)** - Detailed installation guide
- **[INSTALL_MACOS.md](INSTALL_MACOS.md)** - macOS-specific installation guide
- **[README_HURRICANE.md](README_HURRICANE.md)** - Full feature documentation

## ✨ Features

- **Chaos Theory-Based Movement** - Unpredictable whirlwind paths using Lyapunov exponents
- **Dynamic Weather Effects** - Wind, particles, lightning, and rain
- **Command Control** - Easy spawning and management via commands
- **Auto-Spawning** - Whirlwinds can spawn naturally in worlds
- **Performance Optimized** - Configurable particle counts and effects

## 🎮 Commands

```
/whirlwind spawn [world] [radius] [intensity]  - Spawn a whirlwind
/whirlwind list                                 - List active whirlwinds
/whirlwind stop [id]                            - Stop whirlwind(s)
```

## ⚙️ Requirements

- Minecraft Server (Spigot, Paper, or compatible)
- JavaScript Plugin Framework:
  - ScriptCraft
  - SpigotJS
  - Or similar JavaScript-based framework
- Minecraft 1.19+ (check `plugin.yml` for API version)

## 📝 License

Free to use and modify. Based on chaos theory wind pattern algorithms.
