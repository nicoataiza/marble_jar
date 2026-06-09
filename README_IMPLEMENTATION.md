# Virtual Marble Jar - MVP Implementation

## 🎉 Complete & Running

A fully functional 3D marble jar application built with **Next.js 16.2**, **React Three Fiber**, **Rapier Physics**, and **Three.js**.

### ✅ Features Implemented

#### Core Requirements
- ✅ **Clicking adds one marble** - "Add Marble" button increments counter
- ✅ **Definite max capacity** - Limited to 100 marbles (configurable)
- ✅ **Satisfying audio feedback** - Synthesized "clack" sound on collision
- ✅ **React + Next.js + Three.js** - Full tech stack implemented
- ✅ **MVP single-user** - Works standalone without server authentication

#### Technical Features
- 3D Physics Simulation: Marbles fall with gravity, collide with jar walls
- Translucent Glass Jar: Beautiful cyan glass aesthetic with proper physics boundaries
- Random Marble Colors: Each marble gets a unique color with metallic finish
- Real-time UI: Live capacity counter with "Jar is Full" indicator
- Data Persistence: Marble count saved to localStorage, survives page refresh
- OrbitControls: Rotate and zoom the 3D scene
- Professional Lighting: Ambient + point lights for depth and realism

### 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page with state management & UI controls
│   └── globals.css         # Tailwind styles
├── components/
│   ├── Scene.tsx           # Canvas + Physics world setup
│   ├── Jar.tsx             # 3D jar geometry + collision boundaries
│   └── Marble.tsx          # Individual marble physics + audio
public/                       # Static assets (logos, fonts)
next.config.ts              # Next.js configuration
tsconfig.json               # TypeScript configuration
package.json                # Dependencies: three, @react-three/fiber, rapier, etc.
```

### 🚀 Quick Start

```bash
# Development server
npm run dev

# Open http://localhost:3000
# Click "Add Marble" to drop marbles into the jar!
```

### 🎮 Usage

1. **Add Marble**: Click the cyan "Add Marble" button to spawn a marble
2. **Watch Physics**: Marbles fall naturally with gravity
3. **Listen**: Hear a satisfying "clack" on collision
4. **Full Jar**: Button disables when reaching 100 marbles
5. **Reset**: Click "Clear" to reset the marble count
6. **Rotate View**: Drag the canvas to rotate, scroll to zoom

### 🎨 Customization

Edit `src/app/page.tsx` to customize:
- `MAX_CAPACITY`: Change from 100 to any number
- Button colors: Modify Tailwind classes (`bg-cyan-500`, etc.)

Edit `src/components/Jar.tsx` to customize:
- Jar dimensions: `jarWidth`, `jarHeight`, `jarDepth`
- Jar color: `color: '#4dd0e1'` (cyan) to any hex

Edit `src/components/Marble.tsx` to customize:
- Marble size: `args={[0.15]}` in `BallCollider` and `sphereGeometry`
- Physics: `restitution`, `friction`, mass

### 🔊 Audio

The clack sound is generated programmatically using Web Audio API:
- Frequency sweep from 800Hz → 200Hz
- 100ms duration with envelope
- Throttled to prevent overlap sounds

### 📊 Performance

- Turbopack-accelerated development builds (~200ms)
- Client-side rendering for Three.js
- Efficient physics simulation (1/60 timestep)
- Marble pool: Only active marbles are rendered

### 🧪 Browser Support

- Modern browsers with WebGL support
- Chrome, Firefox, Safari (latest versions)
- Requires Web Audio API for sound (degrades gracefully if unavailable)

### 🛠️ Stack

- **Frontend**: Next.js 16.2, React 19, TypeScript
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **Physics**: Rapier (3D physics engine)
- **Styling**: Tailwind CSS
- **Build**: Turbopack (Next.js bundler)

### 📝 Notes

- Marble count persists via localStorage
- Physics simulation runs client-side for responsiveness
- Camera has OrbitControls for free rotation
- Marbles spawn above jar center with slight randomization
- Jar is an open-top container (no lid)

**Enjoy your virtual marble jar! 🎯**
