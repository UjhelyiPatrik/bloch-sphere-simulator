# Bloch Sphere Simulator

An educational interactive 3D visualization of single-qubit states with gate composition, history navigation, and Bloch sphere rendering.

## Features
- Drag-and-drop gate palette (copy on drop) & sortable timeline
- Parametric gates: Rx, Ry, Rz, Phase (math expressions: `pi/2`, `2*pi`, `3*pi/4`)
- Complex amplitude input (supports imaginary: `1/sqrt(2)`, `i/2`, `1/2 + i/3`)
- Step-through history (time-travel) with ghost state vectors for past steps
- 3D Bloch sphere (Three.js + R3F) with labeled poles |0⟩, |1⟩, |+⟩, |−⟩ and axes
- Packaged as a Windows desktop app via Tauri

## Development

### Prerequisites
- Node.js (>=18)
- Rust toolchain (cargo) for Tauri

### Install
```bash
npm install
```

### Run Web Dev (Vite)
```bash
npm run dev
```
Visit http://localhost:5173

### Run Desktop (Tauri Dev)
```bash
npm run tauri:dev
```

### Build Desktop Executable
```bash
npm run tauri:build
```
Artifacts appear under `src-tauri/target/release/`.

## Usage
1. Set initial amplitudes alpha, beta (real or complex expressions). Examples: `1`, `sqrt(2)/2`, `i/2`, `1/2 + i/3`.
2. Add gates from palette. For param gates enter angles (`pi`, `pi/2`, `2*pi/3`).
3. Click timeline items or use controls to navigate history.
4. Observe Bloch sphere updates; previous states are faint ghost arrows.

## Current Limitations / Roadmap
- Expression error highlighting (red border pulse) for invalid gate params & amplitudes.
- Export circuit/state history planned.
- Potential enhancement: UI for amplitude polar form.
- Export circuit/state history planned.

## License
Educational project; no explicit license specified.