# Bloch Sphere Simulator - Felhasználói Dokumentáció

## 1. Bevezetés

A **Bloch Sphere Simulator** egy modern, interaktív oktatóprogram, amelyet kifejezetten a kvantuminformatika alapjainak elsajátítására terveztek. A szoftver célja, hogy vizuális és intuitív módon mutassa be az egy-qubites kvantumállapotokat és azok transzformációit a Bloch-gömbön.

A kvantummechanika absztrakt fogalmai – mint a szuperpozíció, a fázis és az unitér transzformációk – gyakran nehezen érthetők meg kizárólag matematikai levezetések útján. Ez a szimulátor áthidalja a szakadékot az elmélet és a gyakorlat között, lehetővé téve a hallgatók és érdeklődők számára, hogy "kézzelfoghatóvá" tegyék a kvantumállapotokat.

A program asztali alkalmazásként futtatható Windows környezetben, kihasználva a modern webes technológiák (React, Three.js) és a natív teljesítmény (Rust/Tauri) előnyeit.

---

## 2. Elméleti Háttér

A program hatékony használatához érdemes áttekinteni néhány alapvető kvantuminformatikai fogalmat, amelyeket a szimulátor vizualizál.

### 2.1. A Qubit
A klasszikus bitekkel ellentétben, amelyek értéke csak 0 vagy 1 lehet, a kvantumbit (qubit) ezen állapotok lineáris kombinációjában (szuperpozíciójában) is létezhet. Egy tiszta állapotú qubit matematikai leírása:

> **|ψ⟩ = α|0⟩ + β|1⟩**

Ahol:
*   **|0⟩** és **|1⟩**: A számítási bázisállapotok (a klasszikus 0 és 1 megfelelői).
*   **α** és **β**: Komplex amplitúdók, amelyekre igaz a normalizálási feltétel: **|α|² + |β|² = 1**.

### 2.2. A Bloch-gömb
A Bloch-gömb egy egységsugarú gömb, amely geometriailag ábrázolja a qubit tiszta állapotait.
*   **Északi pólus**: A **|0⟩** állapot.
*   **Déli pólus**: A **|1⟩** állapot.
*   **Egyenlítő**: A szuperpozíciós állapotok (pl. **|+⟩**, **|-⟩**, **|+i⟩**, **|-i⟩**).

A gömb felületén bármely pont egy lehetséges qubit állapotnak felel meg. A programban a piros nyíl (állapotvektor) mutatja az aktuális állapotot a gömb középpontjából a felületre.

---

## 3. Funkciók Részletes Bemutatása

### 3.1. Interaktív 3D Vizualizáció
A program központi eleme a 3D-s Bloch-gömb.
*   **Valós idejű renderelés**: A gömb azonnal reagál minden változtatásra.
*   **Forgatás és Nagyítás**: Az egér bal gombjával forgathatja a gömböt, a görgővel pedig nagyíthat, hogy minden szögből megvizsgálhassa az állapotvektort.
*   **Jelölések**: A gömbön fel vannak tüntetve a nevezetes állapotok (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩) és a koordináta-tengelyek.

### 3.2. Idővonal (Timeline) és Szerkesztés
A kvantumáramkörök építése egy intuitív "Drag-and-Drop" (fogd és vidd) felületen történik.
*   **Kapuk hozzáadása**: A bal oldali "Gate Palette"-ről húzza a kívánt kaput az idővonalra.
*   **Sorrend módosítása**: A már lerakott kapuk sorrendje tetszőlegesen változtatható áthúzással.
*   **Törlés**: A kapuk jobb oldalán található 'X' gombbal, vagy az idővonalról való kihúzással törölhetők.
*   **Paraméterezés**: A forgató kapuk (Rx, Ry, Rz, Phase) esetén szöveges mezőben adható meg a forgatás szöge.

### 3.3. Előzmények (History) és "Időutazás"
A szimulátor egyik leghasznosabb funkciója, hogy nem csak a végeredményt mutatja.
*   **Lépésenkénti végrehajtás**: Az idővonal bármelyik elemére kattintva a szimulátor visszaáll arra az állapotra.
*   **Szellem vektorok (Ghost Vectors)**: A "Show History" gomb bekapcsolásával a gömbön halványkék nyilak jelzik az összes korábbi állapotot, így egyetlen ábrán látható a teljes transzformációs sorozat.

---

## 4. Használati Útmutató - Lépésről Lépésre

### 4.1. Kezdeti Állapot Beállítása
A program indításakor a qubit alapértelmezésben a **|0⟩** állapotban van. Ezt a bal oldali panelen módosíthatja az **α** (Alpha) és **β** (Beta) amplitúdók megadásával.

A beviteli mezők támogatják a komplex számokat és matematikai kifejezéseket. A program automatikusan normalizálja a beírt értékeket.

**Példák a bemenetre:**
*   `1` és `0` → **|0⟩** (Északi pólus)
*   `0` és `1` → **|1⟩** (Déli pólus)
*   `1` és `1` → **|+⟩** (X tengely pozitív iránya)
*   `1` és `i` → **|+i⟩** (Y tengely pozitív iránya)
*   `sqrt(0.5)` vagy `1/sqrt(2)` → Pontos értékek megadása.

### 4.2. Egy egyszerű áramkör építése (Példa)
Hozzuk létre a **|-⟩** állapotot a **|0⟩** állapotból!

1.  Győződjön meg róla, hogy a kezdeti állapot **|0⟩** (Alpha=1, Beta=0).
2.  Húzzon egy **H** (Hadamard) kaput az idővonalra.
    *   *Eredmény*: A vektor a **|+⟩** állapotba kerül (X tengely).
3.  Húzzon egy **Z** kaput a Hadamard kapu után.
    *   *Eredmény*: A vektor átfordul a **|-⟩** állapotba (X tengely negatív iránya).
4.  Forgassa a gömböt, hogy meggyőződjön az eredményről.

### 4.3. Paraméteres Kapuk Használata
Próbáljuk ki az **Rx** kaput!
1.  Húzzon egy **Rx** kaput az idővonalra.
2.  A megjelenő beviteli mezőbe írja be: `pi/2`.
3.  Nyomjon Entert vagy kattintson máshova.
4.  A vektor 90 fokkal elfordul az X tengely körül.

---

## 5. Elérhető Kvantumkapuk Katalógusa

A szimulátor az alábbi egy-qubites kapukat támogatja:

### 5.1. Pauli Kapuk
Ezek a kapuk 180 fokos forgatást végeznek a megfelelő tengelyek körül a Bloch-gömbön.
*   **X (NOT kapu)**: Megcseréli a |0⟩ és |1⟩ amplitúdókat. A gömbön 180°-os forgatás az X tengely körül. (|0⟩ → |1⟩)
*   **Y**: 180°-os forgatás az Y tengely körül. (|0⟩ → i|1⟩)
*   **Z**: 180°-os forgatás a Z tengely körül. A fázist változtatja meg. (|+⟩ → |-⟩)

### 5.2. Szuperpozíciós Kapuk
*   **H (Hadamard)**: A legfontosabb kapu a szuperpozíció létrehozására. A bázisállapotokat (|0⟩, |1⟩) az egyenlítőre viszi (|+⟩, |-⟩). Geometriailag egy 180°-os forgatás az X+Z tengely körül.

### 5.3. Fázis Kapuk
Ezek a kapuk a Z tengely körüli forgatások speciális esetei.
*   **S**: 90°-os (π/2) forgatás a Z tengely körül.
*   **T**: 45°-os (π/4) forgatás a Z tengely körül.

### 5.4. Paraméteres Forgatások
Tetszőleges szögű forgatások a Descartes-koordinátarendszer tengelyei körül.
*   **Rx(θ)**: Forgatás az X tengely körül θ szöggel.
*   **Ry(θ)**: Forgatás az Y tengely körül θ szöggel.
*   **Rz(θ)**: Forgatás a Z tengely körül θ szöggel.
*   **Phase(φ)**: Globális fázistolás (fizikailag nem mérhető, de a szimulációban nyomon követhető).

---

## 6. Technikai Specifikációk

A szoftver fejlesztése során a legmodernebb webes és desktop technológiákat alkalmaztuk a teljesítmény és a hordozhatóság érdekében.

### 6.1. Felhasznált Technológiák
*   **React (TypeScript)**: A felhasználói felület alapja, amely komponens-alapú, moduláris felépítést tesz lehetővé.
*   **Vite**: Gyors és modern build eszköz a webes fejlesztéshez.
*   **Tauri**: Egy keretrendszer, amely lehetővé teszi webes technológiák csomagolását natív asztali alkalmazásként. A háttérben Rust nyelven írt, rendkívül hatékony kódot futtat.
*   **Three.js (@react-three/fiber)**: A 3D-s megjelenítésért felelős könyvtár. Hardveres gyorsítást (WebGL) használ a Bloch-gömb rendereléséhez.
*   **Math.js**: A komplex számokkal végzett precíz matematikai műveletek (mátrixszorzások, normalizálás) motorja.
*   **Tailwind CSS**: A modern, reszponzív és esztétikus felhasználói felület stílusozásához.
*   **@dnd-kit**: A "Drag-and-Drop" interakciók kezelésére szolgáló könyvtár.

### 6.2. Rendszerkövetelmények
*   **Operációs Rendszer**: Windows 10/11 (A jelenlegi build Windowsra készült).
*   **Grafikus Kártya**: WebGL 2.0 támogatással rendelkező videókártya ajánlott a sima 3D megjelenítéshez.

---

## 7. Hibaelhárítás és Gyakori Kérdések

**K: Miért látok "NaN" (Not a Number) értéket az állapotvektornál?**
V: Ez általában akkor fordul elő, ha érvénytelen matematikai kifejezést írt be a paraméter mezőbe (pl. nullával való osztás, vagy szintaktikai hiba). Ellenőrizze a beírt képletet!

**K: A gömbön a nyilak egymásba lógnak, nem látom jól.**
V: Használja az egeret a gömb forgatására! A "Show History" kikapcsolásával eltüntetheti a korábbi állapotokat, ha azok zavarják a látványt.

**K: Hogyan adhatok meg negatív számokat?**
V: Egyszerűen használja a mínusz jelet, pl. `-1` vagy `-0.5`.

---

## 8. Fejlesztői Információk

A projekt nyílt forráskódú alapokon nyugszik. A forráskód strukturált és kommentált a könnyebb bővíthetőség érdekében.

### Könyvtárszerkezet
*   `src/components`: A UI elemek (BlochSphere, Timeline, GatePalette) forráskódja.
*   `src/quantum`: A kvantummechanikai számításokat végző motor (engine.ts) és típusdefiníciók.
*   `src-tauri`: A Rust alapú backend konfigurációja.

### Telepítés fejlesztéshez
1.  Node.js és Rust telepítése.
2.  `npm install` parancs futtatása a gyökérkönyvtárban.
3.  `npm run tauri:dev` a fejlesztői mód indításához.

---
*Készítette: Ujhelyi Patrik*
*Dátum: 2025. november 23.*
