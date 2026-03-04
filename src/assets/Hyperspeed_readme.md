# Hyperspeed Angular Component

Converted from `@react-bits/Hyperspeed` — a Three.js + postprocessing highway warp effect.

---

## 1. Install Dependencies

```bash
npm install three postprocessing
npm install --save-dev @types/three
```

---

## 2. Drop the file

Place `hyperspeed.component.ts` anywhere in your project, e.g.:

```
src/app/shared/hyperspeed/hyperspeed.component.ts
```

---

## 3. Import in your module or standalone component

```ts
// app.component.ts (standalone)
import { HyperspeedComponent } from './shared/hyperspeed/hyperspeed.component';

@Component({
  standalone: true,
  imports: [HyperspeedComponent],
  ...
})
export class AppComponent {}
```

---

## 4. Use in template

**Default (turbulent distortion):**
```html
<div style="width: 100vw; height: 100vh; position: relative;">
  <app-hyperspeed></app-hyperspeed>
</div>
```

**With custom options:**
```html
<app-hyperspeed [effectOptions]="myOptions"></app-hyperspeed>
```

```ts
myOptions: HyperspeedOptions = {
  distortion: 'deepDistortion',   // see all presets below
  speedUp: 3,
  fov: 100,
  fovSpeedUp: 160,
  colors: {
    leftCars:  [0xff0000, 0xff4400],
    rightCars: [0x00aaff, 0x0044ff],
    sticks: 0x00ffff,
  },
};
```

---

## 5. Available Distortion Presets

| `distortion` value         | Description                          |
|----------------------------|--------------------------------------|
| `turbulentDistortion`      | Default — chaotic wave (animated)    |
| `turbulentDistortionStill` | Same shape but static (no time)      |
| `mountainDistortion`       | Large rolling hills                  |
| `xyDistortion`             | Smooth X/Y sine waves                |
| `LongRaceDistortion`       | Gentle long sweeping curves          |
| `deepDistortion`           | Deep power-curve dip (animated)      |
| `deepDistortionStill`      | Deep dip, static                     |

---

## 6. All Options

```ts
interface HyperspeedOptions {
  distortion?:                 string;          // preset name
  onSpeedUp?:                  (e) => void;     // fired on mousedown/touchstart
  onSlowDown?:                 (e) => void;     // fired on mouseup/touchend
  length?:                     number;          // road length (default 400)
  roadWidth?:                  number;          // (default 10)
  islandWidth?:                number;          // center divider (default 2)
  lanesPerRoad?:               number;          // (default 4)
  fov?:                        number;          // camera FOV (default 90)
  fovSpeedUp?:                 number;          // FOV while speeding (default 150)
  speedUp?:                    number;          // speed multiplier (default 2)
  carLightsFade?:              number;          // (default 0.4)
  totalSideLightSticks?:       number;          // roadside sticks (default 20)
  lightPairsPerRoadWay?:       number;          // car light pairs (default 40)
  shoulderLinesWidthPercentage?: number;
  brokenLinesWidthPercentage?:   number;
  brokenLinesLengthPercentage?:  number;
  lightStickWidth?:            [min, max];
  lightStickHeight?:           [min, max];
  movingAwaySpeed?:            [min, max];
  movingCloserSpeed?:          [min, max];
  carLightsLength?:            [min, max];
  carLightsRadius?:            [min, max];
  carWidthPercentage?:         [min, max];
  carShiftX?:                  [min, max];
  carFloorSeparation?:         [min, max];
  colors?: {
    roadColor?:     number;   // hex e.g. 0x080808
    islandColor?:   number;
    background?:    number;
    shoulderLines?: number;
    brokenLines?:   number;
    leftCars?:      number[];
    rightCars?:     number[];
    sticks?:        number | number[];
  };
}
```

---

## 7. Notes

- The component runs its animation loop **outside the Angular zone** (`NgZone.runOutsideAngular`) for maximum performance — no unnecessary change detection.
- The canvas fills the parent element. Wrap in a positioned `div` with explicit width/height.
- Clicking or touching the canvas triggers the speed-up effect.
- The component cleans up Three.js, the EffectComposer, and all event listeners on `ngOnDestroy`.
