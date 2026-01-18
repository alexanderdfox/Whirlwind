# Quick Start Guide

Get Elijah's Whirlwind Plugin up and running in 3 steps!

## Step 1: Choose Your Installation Method

### Automated (Easiest)
```bash
chmod +x install.sh
./install.sh
```

### Manual
1. Find your server's plugins directory
2. Copy `ElijahsWhirlwindPlugin.js` to:
   - **ScriptCraft**: `plugins/scriptcraft/plugins/ElijahsWhirlwindPlugin.js`
   - **SpigotJS**: `plugins/SpigotJS/plugins/ElijahsWhirlwindPlugin.js`

## Step 2: Restart Server

Restart your Minecraft server, or:
- If using ScriptCraft, run `/js refresh()` in-game

## Step 3: Test It!

Join your server and try:
```
/whirlwind spawn
```

You should see particles and wind effects at your location!

## Common Commands

| Command | Description |
|---------|-------------|
| `/whirlwind spawn` | Spawn whirlwind at your location |
| `/whirlwind spawn world 100 0.8` | Spawn with custom radius (100) and intensity (0.8) |
| `/whirlwind list` | Show all active whirlwinds |
| `/whirlwind stop` | Stop all whirlwinds |

## Troubleshooting

**Command not working?**
- Make sure you're OP or have `whirlwind.admin` permission
- Type `/op YourName` in server console to give yourself OP

**Plugin not loading?**
- Check server console for errors
- Verify `ElijahsWhirlwindPlugin.js` is in the correct directory
- Make sure your JavaScript framework is installed

**Need help?**
- See [INSTALL.md](INSTALL.md) for detailed instructions
- Check [README_HURRICANE.md](README_HURRICANE.md) for full documentation
