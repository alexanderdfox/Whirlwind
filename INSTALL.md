# Elijah's Whirlwind Plugin - Installation Guide

## Quick Installation

### For ScriptCraft Users

1. **Download ScriptCraft** (if not already installed)
   - Get ScriptCraft from: https://github.com/walterhiggins/ScriptCraft
   - Place `scriptcraft.jar` in your server's `plugins` folder

2. **Install the Plugin**
   ```bash
   # Copy the plugin file to ScriptCraft directory
   cp ElijahsWhirlwindPlugin.js [SERVER_DIR]/plugins/scriptcraft/plugins/
   ```

3. **Restart or Reload**
   - Restart your server, or
   - Run: `/js refresh()` in-game to reload scripts

### For SpigotJS Users

1. **Download SpigotJS** (if not already installed)
   - Get SpigotJS from: https://github.com/SpigotJS/SpigotJS

2. **Install the Plugin**
   ```bash
   # Copy the plugin file to SpigotJS plugins directory
   cp ElijahsWhirlwindPlugin.js [SERVER_DIR]/plugins/SpigotJS/plugins/
   ```

3. **Restart Server**
   - Restart your Minecraft server

### For Standard Spigot/Paper Servers (JavaScript Support)

If your server has JavaScript plugin support through a bridge:

1. Copy `ElijahsWhirlwindPlugin.js` to your server's JavaScript plugins directory
2. Ensure `plugin.yml` is properly configured
3. Restart the server

## Detailed Setup

### Prerequisites

- Minecraft Server (Spigot, Paper, or compatible)
- JavaScript Plugin Framework installed (ScriptCraft, SpigotJS, or similar)
- Server running Minecraft 1.19 or later (check `api-version` in `plugin.yml`)

### File Structure

After installation, your server should have:

```
[SERVER_DIR]/
├── plugins/
│   ├── scriptcraft/          (or SpigotJS/)
│   │   └── plugins/
│   │       └── ElijahsWhirlwindPlugin.js
│   └── (other plugins)
```

### Verification

1. Start your server
2. Look for this message in console: `Elijah's Whirlwind Plugin enabled! Chaos theory whirlwinds are active.`
3. Test in-game: `/whirlwind list` (should show "Active Whirlwinds: 0")

### Commands

Once installed, use these commands in-game:

- `/whirlwind spawn` - Spawn a whirlwind at your location
- `/whirlwind spawn [world] [radius] [intensity]` - Spawn with custom parameters
- `/whirlwind list` - List all active whirlwinds
- `/whirlwind stop` - Stop all whirlwinds
- `/whirlwind stop [id]` - Stop a specific whirlwind

### Permissions

- `whirlwind.admin` - Permission to use whirlwind commands (default: OP)

## Troubleshooting

### Plugin Not Loading

- **Check console for errors** - Look for JavaScript syntax errors
- **Verify file location** - Ensure `ElijahsWhirlwindPlugin.js` is in the correct plugins directory
- **Check framework compatibility** - Ensure your JavaScript framework supports the Bukkit API calls used

### Commands Not Working

- **Verify permissions** - Make sure you have `whirlwind.admin` permission or are OP
- **Check command registration** - Some frameworks require different command registration methods

### Performance Issues

- **Reduce particle count** - Edit `PARTICLE_COUNT` in the `CONFIG` object
- **Increase spawn intervals** - Adjust `MIN_SPAWN_INTERVAL` and `MAX_SPAWN_INTERVAL`
- **Reduce radius** - Lower `MAX_RADIUS` in configuration

## Configuration

Edit the `CONFIG` object in `ElijahsWhirlwindPlugin.js` to customize:

```javascript
const CONFIG = {
    MIN_SPAWN_INTERVAL: 30 * 60 * 20,  // Minimum spawn interval (ticks)
    MAX_SPAWN_INTERVAL: 120 * 60 * 20, // Maximum spawn interval (ticks)
    MIN_RADIUS: 50,                     // Minimum whirlwind radius (blocks)
    MAX_RADIUS: 200,                    // Maximum whirlwind radius (blocks)
    // ... more settings
};
```

## Support

For issues or questions:
1. Check the main README: `README_HURRICANE.md`
2. Review the plugin code comments
3. Check your server console for error messages
