/**
 * Elijah's Whirlwind Plugin for Minecraft
 * Based on chaos theory and realistic meteorological wind patterns
 * Uses Holland Wind Model and Rankine Vortex for accurate whirlwind wind fields
 * Converts Python wind/chaos calculations to JavaScript for Minecraft
 * 
 * Wind Models Used:
 * - Holland Wind Profile Model: Exponential decay of wind speed with distance from center
 * - Rankine Vortex: Solid body rotation near center, exponential decay outside eyewall
 * - Asymmetric Wind Enhancement: Stronger winds on right side of storm motion (Northern Hemisphere)
 * - Cyclonic Rotation: Counterclockwise wind flow around low pressure center
 */

// Note: This plugin requires a JavaScript-based Minecraft framework
// Compatible with: ScriptCraft, SpigotJS, or similar JavaScript plugin systems

const Math = Java.type('java.lang.Math');
const Location = Java.type('org.bukkit.Location');
const Particle = Java.type('org.bukkit.Particle');
const Vector = Java.type('org.bukkit.util.Vector');

// Configuration - Whirlwind spawn and behavior settings
const CONFIG = {
    MIN_SPAWN_INTERVAL: 30 * 60 * 20,  // 30 minutes in ticks
    MAX_SPAWN_INTERVAL: 120 * 60 * 20, // 2 hours in ticks
    MIN_RADIUS: 1,                      // blocks (minimum for random spawn)
    MAX_RADIUS: 1000,                   // blocks (maximum for random spawn)
    // Note: Any radius can be specified manually via command (no hard limit)
    MIN_INTENSITY: 0.5,
    MAX_INTENSITY: 1.0,
    DURATION_TICKS: 60 * 60 * 20,      // 1 hour in ticks
    MOVE_SPEED: 0.1,                    // blocks per tick
    LYAPUNOV_EXPONENT: 0.9,            // bits/day equivalent (chaos theory)
    BUTTERFLY_EFFECT_SCALE: 0.01,
    BASE_WIND_SPEED: 10.0,
    WIND_VARIATION: 0.3,
    SEASONAL_AMPLITUDE: 0.3,
    PARTICLE_COUNT: 100,
    LIGHTNING_CHANCE: 0.001,
    // Real wind pattern parameters (Holland model)
    HOLLAND_B_PARAMETER: 1.5,          // Holland B parameter (typical range 0.5-2.5)
    MAX_WIND_RADIUS_RATIO: 0.3,        // Radius of max winds as fraction of total radius
    WIND_DECAY_EXPONENT: 0.65,         // Wind decay exponent (typically 0.5-0.8)
    ASYMMETRY_FACTOR: 0.25,            // Right-side wind enhancement factor (Northern Hemisphere)
    MIN_WIND_RADIUS_RATIO: 0.05        // Eye size as fraction of total radius (scales with whirlwind size)
};

// Active whirlwinds tracking
const activeWhirlwinds = new Map();
let tickCounter = 0;

/**
 * Whirlwind class - represents an active whirlwind in the world
 * Based on chaos theory wind pattern generation
 */
class Whirlwind {
    constructor(world, centerX, centerZ, centerY, radius, intensity, orientationYaw, orientationPitch) {
        this.world = world;
        this.centerX = centerX;
        this.centerZ = centerZ;
        this.y = centerY !== undefined ? centerY : 64; // Default to sea level if not specified
        this.radius = radius;
        this.intensity = intensity;
        this.age = 0;
        this.maxAge = CONFIG.DURATION_TICKS;
        
        // 6 DOF orientation - whirlwind can point in any 3D direction
        // Default orientation (horizontal if not specified)
        this.orientationYaw = orientationYaw !== undefined ? orientationYaw : (Math.random() * 2 * Math.PI);
        this.orientationPitch = orientationPitch !== undefined ? orientationPitch : (Math.random() - 0.5) * Math.PI / 4; // -45 to +45 degrees
        
        // Calculate forward direction vector (whirlwind's main axis direction)
        this.forwardX = Math.cos(this.orientationYaw) * Math.cos(this.orientationPitch);
        this.forwardY = Math.sin(this.orientationPitch);
        this.forwardZ = Math.sin(this.orientationYaw) * Math.cos(this.orientationPitch);
        
        // Normalize forward vector
        const forwardLen = Math.sqrt(this.forwardX * this.forwardX + this.forwardY * this.forwardY + this.forwardZ * this.forwardZ);
        if (forwardLen > 0.001) {
            this.forwardX /= forwardLen;
            this.forwardY /= forwardLen;
            this.forwardZ /= forwardLen;
        }
        
        // Calculate up vector (perpendicular to forward, pointing generally upward)
        // Use world up (0, 1, 0) and cross product to get right vector
        const worldUpX = 0;
        const worldUpY = 1;
        const worldUpZ = 0;
        
        // Right vector = forward x world up
        this.rightX = this.forwardZ * worldUpY - this.forwardY * worldUpZ;
        this.rightY = this.forwardX * worldUpZ - this.forwardZ * worldUpX;
        this.rightZ = this.forwardY * worldUpX - this.forwardX * worldUpY;
        
        // Normalize right vector
        const rightLen = Math.sqrt(this.rightX * this.rightX + this.rightY * this.rightY + this.rightZ * this.rightZ);
        if (rightLen > 0.001) {
            this.rightX /= rightLen;
            this.rightY /= rightLen;
            this.rightZ /= rightLen;
        } else {
            // Fallback if forward is parallel to up
            this.rightX = 1;
            this.rightY = 0;
            this.rightZ = 0;
        }
        
        // Up vector = right x forward (perpendicular to whirlwind plane)
        this.upX = this.rightY * this.forwardZ - this.rightZ * this.forwardY;
        this.upY = this.rightZ * this.forwardX - this.rightX * this.forwardZ;
        this.upZ = this.rightX * this.forwardY - this.rightY * this.forwardX;
        
        // Normalize up vector
        const upLen = Math.sqrt(this.upX * this.upX + this.upY * this.upY + this.upZ * this.upZ);
        if (upLen > 0.001) {
            this.upX /= upLen;
            this.upY /= upLen;
            this.upZ /= upLen;
        }
        
        // Movement direction based on chaos theory (movement along forward vector)
        this.direction = this.orientationYaw; // Legacy for movement calculations
        this.speed = CONFIG.MOVE_SPEED * (0.5 + intensity);
        
        // Chaos parameters for unpredictable movement (butterfly effect)
        this.chaosPhase = Math.random() * 2 * Math.PI;
        this.lyapunov = CONFIG.LYAPUNOV_EXPONENT;
        
        // Real wind pattern parameters (Holland model)
        // Maximum sustained wind speed at eyewall (typically 15-50 m/s for real whirlwinds)
        // Wind speed scales with radius for larger whirlwinds
        const baseWindSpeed = CONFIG.BASE_WIND_SPEED * (5.0 + intensity * 20.0);
        this.maxWindSpeed = baseWindSpeed * Math.pow(radius / 100.0, 0.3); // Slight scale factor for larger whirlwinds
        this.radiusMaxWind = radius * CONFIG.MAX_WIND_RADIUS_RATIO; // Radius of maximum winds
        this.radiusMinWind = Math.max(radius * CONFIG.MIN_WIND_RADIUS_RATIO, 0.5); // Eye size (scales with radius, minimum 0.5 blocks)
        this.hollandB = CONFIG.HOLLAND_B_PARAMETER;
        
        // Wind pattern parameters
        this.windSpeed = this.maxWindSpeed; // Peak wind speed
        this.windDirection = this.orientationYaw;
        
        // Trajectory storage for visualization
        this.trajectory = [];
        this.maxTrajectoryPoints = 100;
        
        // Forward motion vector for asymmetric wind calculations (3D)
        this.forwardMotionX = this.forwardX * this.speed;
        this.forwardMotionY = this.forwardY * this.speed;
        this.forwardMotionZ = this.forwardZ * this.speed;
    }
    
    /**
     * Update whirlwind each tick - movement, effects, visuals
     */
    update() {
        this.age++;
        
        // Update chaos-based movement (butterfly effect)
        this.updateChaosMovement();
        
        // Update center position (move along forward vector in 3D)
        this.centerX += this.forwardX * this.speed;
        this.y += this.forwardY * this.speed;
        this.centerZ += this.forwardZ * this.speed;
        
        // Update forward motion vector for asymmetric wind calculations (3D)
        this.forwardMotionX = this.forwardX * this.speed;
        this.forwardMotionY = this.forwardY * this.speed;
        this.forwardMotionZ = this.forwardZ * this.speed;
        
        // Update wind pattern (seasonal and temporal variations)
        this.updateWindPattern();
        
        // Apply effects to nearby entities
        this.applyEffects();
        
        // Spawn visual effects
        this.spawnVisualEffects();
        
        // Store trajectory point
        this.trajectory.push({x: this.centerX, z: this.centerZ});
        if (this.trajectory.length > this.maxTrajectoryPoints) {
            this.trajectory.shift();
        }
        
        // Check if whirlwind should dissipate
        return this.age < this.maxAge;
    }
    
    /**
     * Update movement using chaos theory (Lorenz attractor-like behavior)
     * Based on Lyapunov exponent and butterfly effect
     */
    updateChaosMovement() {
        // Chaos amplification over time (from Python script)
        const timeScale = this.age / 20.0; // ticks to seconds
        const chaosFactor = Math.exp(this.lyapunov * timeScale / 86400.0) * CONFIG.BUTTERFLY_EFFECT_SCALE;
        
        // Add chaotic variation to direction
        const noise = (Math.random() - 0.5) * 2 * chaosFactor;
        this.chaosPhase += 0.1 + noise;
        
        // Apply sinusoidal variation with chaos
        const variation = Math.sin(this.chaosPhase) * chaosFactor * 0.5;
        this.direction += variation;
        
        // Normalize direction
        this.direction = this.direction % (2 * Math.PI);
    }
    
    /**
     * Update wind pattern based on seasonal and temporal variations
     * Based on generate_wind_pattern from Python script
     */
    updateWindPattern() {
        const time = this.world.getTime();
        const dayOfYear = (time / 24000) % 365;
        const month = Math.floor((dayOfYear / 365) * 12) + 1;
        
        // Seasonal variation (stronger in certain months)
        const seasonalFactor = 1.0 + CONFIG.SEASONAL_AMPLITUDE * Math.sin(2 * Math.PI * month / 12);
        
        // Update maximum wind speed (base value scaled by intensity and season)
        this.maxWindSpeed = CONFIG.BASE_WIND_SPEED * (5.0 + this.intensity * 20.0) * seasonalFactor;
        
        // Temporal variation (hourly changes)
        const hourVariation = Math.sin(time / 1000) * CONFIG.WIND_VARIATION;
        this.maxWindSpeed *= (1.0 + hourVariation);
        
        // Store reference wind speed for info display
        this.windSpeed = this.maxWindSpeed;
    }
    
    /**
     * Calculate realistic wind speed at a given distance from whirlwind center
     * Based on Holland wind profile model
     * @param {number} distance - Distance from center in blocks
     * @return {number} Wind speed in m/s equivalent
     */
    calculateWindSpeed(distance) {
        // Eye region - calm winds (scales with whirlwind size)
        if (distance < this.radiusMinWind) {
            return distance / this.radiusMinWind * this.maxWindSpeed * 0.1;
        }
        
        // Inside radius of maximum winds - Rankine vortex (solid body rotation)
        if (distance < this.radiusMaxWind) {
            // Linear increase from eye to eyewall
            const ratio = distance / this.radiusMaxWind;
            return this.maxWindSpeed * ratio;
        }
        
        // Outside radius of maximum winds - Exponential decay (Holland model)
        // V(r) = Vmax * (Rmax/r)^b
        const r = distance;
        const rMax = this.radiusMaxWind;
        const b = this.hollandB;
        
        // Use exponential decay with Holland B parameter
        const windSpeed = this.maxWindSpeed * Math.pow(rMax / r, CONFIG.WIND_DECAY_EXPONENT);
        
        // Ensure wind speed doesn't go negative or become too weak at large distances
        return Math.max(windSpeed, 0.5);
    }
    
    /**
     * Calculate wind vector at a given location relative to whirlwind center (3D)
     * Uses realistic cyclonic rotation and asymmetric enhancement with 6 DOF orientation
     * @param {number} x - X coordinate relative to center
     * @param {number} y - Y coordinate relative to center
     * @param {number} z - Z coordinate relative to center
     * @return {Object} Wind vector with x, y, z components in world space
     */
    calculateWindVector3D(x, y, z) {
        // Project point onto whirlwind plane (perpendicular to forward vector)
        // Find distance from center in the whirlwind's local 2D plane
        const relX = x;
        const relY = y;
        const relZ = z;
        
        // Project onto plane perpendicular to forward vector
        // Distance in plane = sqrt(dot(rel, rel) - dot(rel, forward)^2)
        const dotRelForward = relX * this.forwardX + relY * this.forwardY + relZ * this.forwardZ;
        const relDistSq = relX * relX + relY * relY + relZ * relZ;
        const distance = Math.sqrt(relDistSq - dotRelForward * dotRelForward);
        
        // No wind at center or beyond outer radius
        if (distance < 0.1 || distance > this.radius) {
            return {x: 0, y: 0, z: 0, speed: 0};
        }
        
        // Calculate base wind speed using Holland model
        let windSpeed = this.calculateWindSpeed(distance);
        
        // Get position in whirlwind's local coordinate system (right/up plane)
        const rightComponent = relX * this.rightX + relY * this.rightY + relZ * this.rightZ;
        const upComponent = relX * this.upX + relY * this.upY + relZ * this.upZ;
        
        // Calculate angle in whirlwind plane
        const positionAngle = Math.atan2(upComponent, rightComponent);
        
        // Cyclonic rotation: wind flows counterclockwise in the whirlwind plane
        // Wind direction is perpendicular to radius vector, rotated 90 degrees counterclockwise
        const windAngle = positionAngle + (Math.PI / 2);
        
        // Calculate local wind direction (tangent to circle in whirlwind plane)
        const localWindRight = -Math.sin(windAngle); // Perpendicular in right direction
        const localWindUp = Math.cos(windAngle); // Perpendicular in up direction
        
        // Convert local wind vector to world space
        const windX = localWindRight * this.rightX + localWindUp * this.upX;
        const windY = localWindRight * this.rightY + localWindUp * this.upY;
        const windZ = localWindRight * this.rightZ + localWindUp * this.upZ;
        
        // Asymmetric wind enhancement (right side of storm gets stronger winds)
        // Project forward motion onto whirlwind plane for asymmetry calculation
        const forwardInPlaneRight = this.forwardMotionX * this.rightX + this.forwardMotionY * this.rightY + this.forwardMotionZ * this.rightZ;
        const forwardInPlaneUp = this.forwardMotionX * this.upX + this.forwardMotionY * this.upY + this.forwardMotionZ * this.upZ;
        const forwardAngle = Math.atan2(forwardInPlaneUp, forwardInPlaneRight);
        const angleRelativeToForward = positionAngle - forwardAngle;
        
        // Right side gets enhancement (angle near 0 or 2π)
        const asymmetryAngle = Math.cos(angleRelativeToForward);
        const asymmetryEnhancement = 1.0 + CONFIG.ASYMMETRY_FACTOR * Math.max(0, asymmetryAngle);
        windSpeed *= asymmetryEnhancement;
        
        // Scale wind vector by speed
        return {
            x: windX * windSpeed,
            y: windY * windSpeed,
            z: windZ * windSpeed,
            speed: windSpeed
        };
    }
    
    /**
     * Legacy 2D wind calculation (for backward compatibility)
     * Projects 3D wind onto horizontal plane
     */
    calculateWindVector(x, z) {
        const wind3D = this.calculateWindVector3D(x, 0, z);
        return {
            u: wind3D.x,
            v: wind3D.z,
            speed: wind3D.speed
        };
    }
    
    /**
     * Apply whirlwind effects to nearby entities using realistic wind patterns (3D)
     * Uses Holland wind model with cyclonic rotation and asymmetric enhancement
     */
    applyEffects() {
        const centerLoc = new Location(this.world, this.centerX, this.y, this.centerZ);
        const nearbyEntities = this.world.getNearbyEntities(centerLoc, this.radius * 1.5);
        
        for (const entity of nearbyEntities) {
            const loc = entity.getLocation();
            const dx = loc.getX() - this.centerX;
            const dy = loc.getY() - this.y;
            const dz = loc.getZ() - this.centerZ;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            if (distance <= this.radius && distance > 0.1) {
                // Calculate realistic 3D wind vector using Holland model
                const wind = this.calculateWindVector3D(dx, dy, dz);
                
                // Convert wind speed to force (scale factor for Minecraft physics)
                // Real wind speeds are in m/s, but we need to scale for entity velocity
                const forceScale = 0.04; // Scaling factor to convert wind speed to velocity
                const windX = wind.x * forceScale;
                const windY = wind.y * forceScale;
                const windZ = wind.z * forceScale;
                
                // Apply wind velocity to entity (full 3D)
                const velocity = entity.getVelocity();
                entity.setVelocity(velocity.add(new Vector(windX, windY, windZ)));
                
                // Damage effect based on wind speed (higher winds = more damage chance)
                // Real whirlwind wind damage thresholds:
                // Category 1 (33-42 m/s): Minimal
                // Category 2 (43-49 m/s): Moderate  
                // Category 3 (50-58 m/s): Extensive
                // Category 4 (59-69 m/s): Extreme
                // Category 5 (70+ m/s): Catastrophic
                const windSpeedMs = wind.speed;
                let damageChance = 0;
                
                if (windSpeedMs > 20) { // ~45 mph, Category 1 threshold
                    damageChance = 0.005;
                }
                if (windSpeedMs > 30) { // ~67 mph, Category 2 threshold
                    damageChance = 0.01;
                }
                if (windSpeedMs > 40) { // ~90 mph, Category 3 threshold
                    damageChance = 0.02;
                }
                if (windSpeedMs > 50) { // ~112 mph, Category 4 threshold
                    damageChance = 0.04;
                }
                
                if (Math.random() < damageChance) {
                    entity.damage(1.0 * (windSpeedMs / 30.0)); // More damage with higher winds
                }
            }
        }
    }
    
    /**
     * Spawn visual effects (particles, lightning, rain) - positioned in 3D space
     */
    spawnVisualEffects() {
        // Scale particle count with whirlwind size (but cap for performance)
        const sizeFactor = Math.min(this.radius / 100.0, 3.0); // Cap at 3x for very large whirlwinds
        const particleCount = Math.floor(CONFIG.PARTICLE_COUNT * this.intensity * sizeFactor);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position in whirlwind's local 2D plane (perpendicular to forward vector)
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * this.radius;
            
            // Position in whirlwind plane using right and up vectors
            const localRight = Math.cos(angle) * radius;
            const localUp = Math.sin(angle) * radius;
            
            // Convert to world coordinates
            const x = this.centerX + localRight * this.rightX + localUp * this.upX;
            const y = this.y + localRight * this.rightY + localUp * this.upY;
            const z = this.centerZ + localRight * this.rightZ + localUp * this.upZ;
            
            const loc = new Location(this.world, x, y, z);
            
            // Water/rain particles
            this.world.spawnParticle(
                Particle.WATER_SPLASH,
                loc, 1, 0.1, 0.1, 0.1, 0.1
            );
            
            // Cloud particles
            this.world.spawnParticle(
                Particle.CLOUD,
                loc, 1, 0.5, 0.5, 0.5, 0.1
            );
        }
        
        // Lightning strikes (chaotic timing) - positioned in 3D whirlwind plane
        if (Math.random() < CONFIG.LIGHTNING_CHANCE * this.radius * this.intensity) {
            const strikeAngle = Math.random() * 2 * Math.PI;
            const strikeRadius = Math.random() * this.radius * 0.8;
            
            // Position in whirlwind plane
            const localRight = Math.cos(strikeAngle) * strikeRadius;
            const localUp = Math.sin(strikeAngle) * strikeRadius;
            
            const strikeX = this.centerX + localRight * this.rightX + localUp * this.upX;
            const strikeY = this.y + localRight * this.rightY + localUp * this.upY;
            const strikeZ = this.centerZ + localRight * this.rightZ + localUp * this.upZ;
            
            // Use world's highest block at that X/Z, or use calculated Y
            const strikeLoc = this.world.getHighestBlockAt(
                Math.floor(strikeX), Math.floor(strikeZ)
            ).getLocation();
            // Use the 3D calculated Y if it's reasonable, otherwise use highest block
            if (strikeY > strikeLoc.getY() && strikeY < strikeLoc.getY() + 50) {
                strikeLoc.setY(strikeY);
            } else {
                strikeLoc.setY(strikeLoc.getY() + 1);
            }
            
            this.world.strikeLightning(strikeLoc);
        }
    }
    
    getInfo() {
        return {
            center: {x: this.centerX, z: this.centerZ, y: this.y},
            radius: this.radius,
            intensity: this.intensity,
            age: this.age,
            maxAge: this.maxAge,
            windSpeed: this.maxWindSpeed,
            maxWindRadius: this.radiusMaxWind,
            category: Math.floor((this.maxWindSpeed / 5.0) - 1) // Rough category estimate
        };
    }
}

/**
 * Generate wind pattern for a location (based on chaos theory)
 * Converted from Python generate_wind_pattern function
 */
function generateWindPattern(world, x, z, time) {
    // Base wind direction (seasonal variation)
    const dayOfYear = (time / 24000) % 365;
    const month = Math.floor((dayOfYear / 365) * 12) + 1;
    const seasonalAngle = (2 * Math.PI * month / 12) + (time / 1000);
    
    // Add chaotic variation (butterfly effect)
    const chaosFactor = Math.sin(x * 0.01) * Math.cos(z * 0.01) * time * CONFIG.BUTTERFLY_EFFECT_SCALE;
    const windAngle = seasonalAngle + chaosFactor;
    
    // Wind speed with seasonal variation
    const seasonalSpeed = CONFIG.BASE_WIND_SPEED * (1.0 + CONFIG.SEASONAL_AMPLITUDE * Math.sin(2 * Math.PI * month / 12));
    const speedVariation = (Math.random() - 0.5) * CONFIG.WIND_VARIATION;
    const windSpeed = seasonalSpeed * (1.0 + speedVariation);
    
    return {
        angle: windAngle,
        speed: windSpeed,
        u: Math.cos(windAngle) * windSpeed, // East component
        v: Math.sin(windAngle) * windSpeed  // North component
    };
}

/**
 * Spawn a new whirlwind at a random location with random 3D orientation
 */
function spawnWhirlwind(world) {
    const worldBorder = world.getWorldBorder();
    const center = worldBorder.getCenter();
    const size = worldBorder.getSize();
    
    // Random spawn location within world border
    const x = center.getX() + (Math.random() - 0.5) * size * 0.8;
    const z = center.getZ() + (Math.random() - 0.5) * size * 0.8;
    const y = world.getHighestBlockYAt(Math.floor(x), Math.floor(z));
    
    // Random whirlwind properties
    const radius = CONFIG.MIN_RADIUS + Math.random() * (CONFIG.MAX_RADIUS - CONFIG.MIN_RADIUS);
    const intensity = CONFIG.MIN_INTENSITY + Math.random() * (CONFIG.MAX_INTENSITY - CONFIG.MIN_INTENSITY);
    
    // Random 3D orientation (6 DOF) - yaw (0-2π) and pitch (-π/2 to π/2)
    const orientationYaw = Math.random() * 2 * Math.PI;
    const orientationPitch = (Math.random() - 0.5) * Math.PI; // -90 to +90 degrees
    
    const whirlwind = new Whirlwind(world, x, z, y, radius, intensity, orientationYaw, orientationPitch);
    const whirlwindId = activeWhirlwinds.size + 1;
    activeWhirlwinds.set(whirlwindId, whirlwind);
    
    // Announce to nearby players
    const players = world.getPlayers();
    for (const player of players) {
        const distance = Math.sqrt(
            Math.pow(player.getLocation().getX() - x, 2) +
            Math.pow(player.getLocation().getZ() - z, 2)
        );
        
        if (distance < radius * 2) {
            player.sendMessage(`§c⚠ ELIJAH'S WHIRLWIND WARNING: Category ${Math.floor(intensity * 5)} whirlwind approaching!`);
        }
    }
    
    return whirlwindId;
}

/**
 * Main plugin tick handler - runs every tick
 */
function onTick() {
    tickCounter++;
    
    // Update all active whirlwinds
    const toRemove = [];
    for (const [id, whirlwind] of activeWhirlwinds) {
        if (!whirlwind.update()) {
            toRemove.push(id);
        }
    }
    
    // Remove dissipated whirlwinds
    for (const id of toRemove) {
        activeWhirlwinds.delete(id);
    }
    
    // Randomly spawn new whirlwinds
    if (activeWhirlwinds.size === 0 || Math.random() < 0.001) {
        const worlds = Bukkit.getWorlds();
        if (worlds.length > 0) {
            const randomWorld = worlds[Math.floor(Math.random() * worlds.length)];
            spawnWhirlwind(randomWorld);
        }
    }
}

/**
 * Command handler: /whirlwind spawn [world] [radius] [intensity]
 */
function onWhirlwindCommand(sender, command, label, args) {
    if (!sender.hasPermission('whirlwind.admin')) {
        sender.sendMessage('§cYou do not have permission to use this command.');
        return true;
    }
    
    if (args.length === 0 || args[0].equalsIgnoreCase('spawn')) {
        let world = sender.getWorld();
        
        if (args.length > 1) {
            world = Bukkit.getWorld(args[1]);
            if (!world) {
                sender.sendMessage(`§cWorld '${args[1]}' not found.`);
                return true;
            }
        }
        
        const location = sender.getLocation();
        // Allow any radius size (no hard limits)
        let radius = args.length > 2 ? parseFloat(args[2]) : (CONFIG.MIN_RADIUS + CONFIG.MAX_RADIUS) / 2;
        // Validate radius is positive
        if (isNaN(radius) || radius <= 0) {
            radius = 100; // Default to 100 blocks if invalid
            sender.sendMessage(`§eInvalid radius, using default: ${radius}`);
        }
        const intensity = args.length > 3 ? parseFloat(args[3]) : 0.75;
        
        // Use player's look direction for whirlwind orientation (6 DOF)
        const direction = location.getDirection();
        // Convert direction vector to yaw and pitch
        const yaw = -Math.atan2(direction.getX(), direction.getZ());
        const pitch = Math.asin(direction.getY());
        
        // Optional: allow manual orientation override
        const orientationYaw = args.length > 4 ? parseFloat(args[4]) * Math.PI / 180 : yaw; // Convert degrees to radians
        const orientationPitch = args.length > 5 ? parseFloat(args[5]) * Math.PI / 180 : pitch;
        
        const whirlwind = new Whirlwind(world, location.getX(), location.getZ(), location.getY(), radius, intensity, orientationYaw, orientationPitch);
        const id = activeWhirlwinds.size + 1;
        activeWhirlwinds.set(id, whirlwind);
        
        sender.sendMessage(`§aElijah's Whirlwind spawned! ID: ${id}, Radius: ${radius}, Intensity: ${intensity}`);
        return true;
    }
    
    if (args[0].equalsIgnoreCase('list')) {
        sender.sendMessage(`§eActive Whirlwinds: ${activeWhirlwinds.size}`);
        for (const [id, whirlwind] of activeWhirlwinds) {
            const info = whirlwind.getInfo();
            sender.sendMessage(`§7  ID ${id}: (${info.center.x.toFixed(1)}, ${info.center.z.toFixed(1)}), ` +
                             `Radius: ${info.radius}, Intensity: ${info.intensity.toFixed(2)}`);
        }
        return true;
    }
    
    if (args[0].equalsIgnoreCase('stop')) {
        if (args.length > 1) {
            const id = parseInt(args[1]);
            if (activeWhirlwinds.has(id)) {
                activeWhirlwinds.delete(id);
                sender.sendMessage(`§aWhirlwind ${id} stopped.`);
            } else {
                sender.sendMessage(`§cWhirlwind ${id} not found.`);
            }
        } else {
            activeWhirlwinds.clear();
            sender.sendMessage('§aAll whirlwinds stopped.');
        }
        return true;
    }
    
    sender.sendMessage('§eUsage: /whirlwind [spawn|list|stop] [world] [radius] [intensity] [yaw_deg] [pitch_deg]');
    sender.sendMessage('§7  radius: Any size from tiny (0.1) to huge (1000+ blocks)');
    sender.sendMessage('§7  Optional: yaw_deg and pitch_deg set 3D orientation (default: uses your look direction)');
    return true;
}

// Plugin initialization
exports.onEnable = function() {
    // Register tick handler
    setInterval(onTick, 1); // 1 tick = 50ms
    
    // Register command (adjust based on your plugin framework)
    const command = Bukkit.getPluginCommand('whirlwind');
    if (command) {
        command.setExecutor(onWhirlwindCommand);
    }
    
    print('Elijah\'s Whirlwind Plugin enabled! Chaos theory whirlwinds are active.');
};

exports.onDisable = function() {
    activeWhirlwinds.clear();
    print('Elijah\'s Whirlwind Plugin disabled. All whirlwinds cleared.');
};

exports.getActiveWhirlwinds = function() {
    return activeWhirlwinds;
};

exports.getConfig = function() {
    return CONFIG;
};
