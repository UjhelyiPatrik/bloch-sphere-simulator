# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## Project: Modern Bloch Sphere Simulator (Standalone Desktop App)
**Version:** 2.0
**Target Platform:** Windows (Standalone .exe via Tauri)
**Framework:** React + TypeScript + Three.js

---

### 1. PROJECT OVERVIEW
The goal is to develop an educational, interactive 3D visualization tool for quantum qubit states. [cite_start]The application must run as a native Windows executable without requiring the user to install a development environment[cite: 6, 9].
[cite_start]Key differentiators for maximum grading[cite: 20, 21]:
1.  **Creative UI:** Drag-and-drop gate composition.
2.  **Advanced Control:** Time-travel debugging (step forward/backward).
3.  **Visualization:** 3D rendering of the Bloch sphere with support for multiple state visualization (ghost states) and specific pole labeling.

---

### 2. TECH STACK & LIBRARIES
* **Core:** React (TypeScript) – For type-safe UI logic.
* **Build/Bundler:** Vite – High-performance tooling.
* **Desktop Wrapper:** Tauri (Rust) – To package the web app as a lightweight `.exe`.
* **Math Engine:** `math.js` – For complex number arithmetic and matrix operations.
* **3D Engine:** `Three.js` + `@react-three/fiber` (R3F) + `@react-three/drei`.
* **UI/Styling:** Tailwind CSS.
* **Drag & Drop:** `@dnd-kit/core` and `@dnd-kit/sortable`.

---

### 3. INITIAL STEPS (Developer Setup)
*Before writing code, establish the environment:*

1.  **Prerequisites:** Ensure Node.js and Rust are installed on the development machine.
2.  **Scaffolding:**
    ```bash
    npm create vite@latest bloch-sim -- --template react-ts
    cd bloch-sim
    npm install
    ```
3.  **Tauri Initialization:**
    ```bash
    npm install @tauri-apps/cli @tauri-apps/api
    npx tauri init
    # (Accept default settings, ensure 'dist' is set as the web asset folder)
    ```
4.  **Install Dependencies:**
    ```bash
    npm install three @types/three @react-three/fiber @react-three/drei
    npm install mathjs
    npm install tailwindcss postcss autoprefixer
    npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
    ```
5.  **Tailwind Init:** Run `npx tailwindcss init -p` and configure `content` paths in `tailwind.config.js`.

---

### 4. FUNCTIONAL REQUIREMENTS (The "Engine")

#### 4.1. Quantum State Logic
* **Representation:** Store the state internally as a complex vector `[alpha, beta]` using `math.complex`.
* **Conversion:** Implement a utility to convert the vector to spherical coordinates ($\theta, \phi$) for the 3D engine.
    * *Implementation Tip:* Use `math.js` to ensure precision. Remember to normalize the vector after every gate operation to keep the total probability at 1.

#### 4.2. Quantum Gates & Parameter Input
* **Supported Gates:** Pauli-X, Y, Z, Hadamard, S, T, Phase, Rx, Ry, Rz.
* [cite_start]**Parametric Input:** For rotation gates (Rx, Ry, Rz, Phase), the user must input the angle via **keyboard** (Text Input), not sliders[cite: 16].
* **Expression Parsing:** The input field must accept mathematical strings like `"pi"`, `"pi/2"`, or `"2*pi"`.
    * *How-to:* Use `math.evaluate(userInputString)` inside a try-catch block. If evaluation fails, highlight the input border in red.

#### 4.3. History & Step-by-Step Navigation
* **Data Structure:** Maintain a `history` array containing the state vector after *each* step.
* **Navigation:** Implement a `stepIndex` pointer.
    * **Step Forward:** Increment index, render `history[index + 1]`.
    * **Step Backward:** Decrement index, render `history[index - 1]`. [cite_start]This fulfills the requirement to show multiple states/navigate history[cite: 19].

---

### 5. UI/UX REQUIREMENTS

#### 5.1. Drag & Drop Gate Composition
* **Goal:** Create a "Circuit Composer" feel.
* **Implementation Strategy:**
    * **Sidebar (Palette):** A list of draggable gate icons. Use `useDraggable` (from dnd-kit) or ensure they create a copy when dragged.
    * **Timeline (Drop Zone):** A horizontal container using `SortableContext` (from dnd-kit).
    * **Logic:** When an item is dropped into the Timeline, add a new "Command" object to the state and trigger a recalculation of the quantum state history.
    * **Reordering:** Allow users to drag a gate within the Timeline to change the execution order.

#### 5.2. Control Dashboard
* [cite_start]**Inputs:** Complex number inputs ($\alpha, \beta$) for arbitrary start states[cite: 19].
* **Playback Controls:** Buttons for `< Prev`, `Next >`, `<< Start`, `End >>`.
* **Visual Feedback:** Highlight the currently active gate in the Timeline corresponding to the 3D view.

---

### 6. 3D VISUALIZATION REQUIREMENTS

#### 6.1. The Bloch Sphere
* **Sphere:** Render a transparent wireframe or glass-like sphere so internal/back-facing vectors are visible.
* **Vectors:**
    * **Current State:** A solid, bright arrow (e.g., Neon Blue).
    * [cite_start]**Ghost States (Optional but recommended):** Render previous steps as faint, semi-transparent arrows to show the "path" of the transformation[cite: 19].

#### 6.2. Labels & Markers
* [cite_start]**Requirements:** Explicitly label the poles and axes[cite: 15].
* **Implementation:** Use the `<Text>` component from `@react-three/drei` to place 3D labels that always face the camera (billboarding).
    * Positions:
        * $|0\rangle$ at $(0, 1, 0)$
        * $|1\rangle$ at $(0, -1, 0)$
        * $|+\rangle$ at $(1, 0, 0)$
        * $|-\rangle$ at $(-1, 0, 0)$

#### 6.3. Interactivity
* **Controls:** Use `<OrbitControls>` to allow the user to rotate the sphere and zoom in/out with the mouse.

---

### 7. ARCHITECTURE & PATTERNS

#### 7.1. Command Pattern
Encapsulate every gate operation as an object.
```typescript
interface GateCommand {
  id: string;
  type: 'H' | 'X' | 'RZ' ...;
  params?: string; // e.g., "pi/2"
  execute: (state: ComplexVector) => ComplexVector;
}