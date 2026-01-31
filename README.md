# Elijah's Whirlwind — 3D Placer

A 3D web app (HTML/JS/CSS) that lets you **place whirlwinds anywhere** in a scene. The whirlwind logic is ported from the Minecraft plugin (Holland wind model, 6-DOF orientation, cyclonic rotation).

## How to run

1. **Option A — Local server (recommended)**  
   From the project root or from `app/`:
   ```bash
   npx serve app
   ```
   Then open `http://localhost:3000` (or the URL shown).

2. **Option B — Open file**  
   Some browsers allow opening `index.html` directly. If you see CORS or module errors, use Option A.

## Controls

- **Click on the ground** to place a whirlwind at that point.
- **Radius** — size of the whirlwind (1–80).
- **Intensity** — strength 0.2–1.0.
- **Pitch** — tilt in degrees (-90 to 90).
- **Drag** — rotate camera (OrbitControls).
- **Scroll** — zoom.
- **Remove** — per-whirlwind button in the list.
- **Clear all** — remove every whirlwind.
- **Model** — per whirlwind, click **Model** and select a **USDA**, **STL**, or **3MF** file. The model is **centered** at the whirlwind and **scaled** to the whirlwind size using the **Model size (% of whirlwind radius)** slider (default 90%). The whirlwind’s wind field then displaces the geometry.

## Tech

- **Three.js** (ES modules from unpkg).
- Whirlwind math: same as plugin (forward/right/up, Holland profile, 3D wind vector).
- Visualization: particle ring that rotates in the whirlwind plane + base ring.
- **Models**: USDA (minimal Pixar USD ASCII parser), STL (Three.js STLLoader), 3MF (Three.js ThreeMFLoader). Loaded geometry is shown as a point cloud and displaced by the whirlwind wind field each frame.
