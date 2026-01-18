# Elijah's Whirlwind Plugin for Minecraft

A Minecraft plugin that generates realistic whirlwinds based on chaos theory and wind pattern algorithms converted from Python.

## Features

- **Chaos Theory-Based Movement**: Whirlwinds move unpredictably using Lyapunov exponents and butterfly effect calculations
- **Wind Pattern Generation**: Seasonal and temporal wind variations based on the original Python wind pattern functions
- **Dynamic Effects**: 
  - Cyclonic wind forces that push entities
  - Visual particle effects (water, clouds)
  - Random lightning strikes
  - Damage for high-intensity whirlwinds
- **Automatic Spawning**: Whirlwinds can spawn randomly in worlds
- **Command Control**: Spawn, list, and stop whirlwinds via commands

## Installation

**For quick installation, see [INSTALL.md](INSTALL.md) or run `./install.sh`**

### Quick Steps:
1. Install a JavaScript-based Minecraft plugin framework:
   - **ScriptCraft** (for older versions)
   - **SpigotJS** (JavaScript wrapper for Spigot)
   - Or another JavaScript plugin system

2. Copy `ElijahsWhirlwindPlugin.js` to your plugin's JavaScript directory
   - ScriptCraft: `plugins/scriptcraft/plugins/`
   - SpigotJS: `plugins/SpigotJS/plugins/`

3. Restart your server or reload scripts

## Commands

- `/whirlwind spawn [world] [radius] [intensity]` - Spawn a whirlwind at your location
- `/whirlwind list` - List all active whirlwinds
- `/whirlwind stop [id]` - Stop a specific whirlwind or all whirlwinds

## Configuration

Edit the `CONFIG` object in `ElijahsWhirlwindPlugin.js` to customize:
- Spawn intervals
- Whirlwind size and intensity ranges
- Movement speed
- Visual effects intensity
- Chaos theory parameters (Lyapunov exponent, butterfly effect scale)

## How It Works

### Chaos Theory
The plugin uses chaos theory calculations from the original Python script:
- **Lyapunov Exponent**: Controls how quickly small changes amplify
- **Butterfly Effect**: Unpredictable movement patterns
- **Wind Patterns**: Seasonal and temporal variations

### Whirlwind Behavior
Each whirlwind:
1. Moves in a chaotic, unpredictable pattern
2. Applies cyclonic wind forces to nearby entities
3. Spawns visual effects (particles, lightning)
4. Dissipates after a set duration

## Converting Python Functions

The JavaScript code converts these Python functions:
- `generate_wind_pattern()` → `generateWindPattern()`
- Chaos amplification calculations → `updateChaosMovement()`
- Seasonal wind variations → `updateWindPattern()`
- Haversine distance calculations → Built into entity distance checks

## Notes

- This plugin requires a JavaScript-based Minecraft framework
- For standard Spigot/Paper servers, you would need to convert this to Java
- The chaos theory calculations are simplified for real-time performance
- Adjust particle counts and update frequencies for server performance

## License

Free to use and modify. Based on chaos theory wind pattern algorithms.
