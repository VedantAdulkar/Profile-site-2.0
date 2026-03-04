import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  NgZone,
} from '@angular/core';
import * as THREE from 'three';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from 'postprocessing';

// ─── Public Types ────────────────────────────────────────────────────────────

export interface HyperspeedColors {
  roadColor?: number;
  islandColor?: number;
  background?: number;
  shoulderLines?: number;
  brokenLines?: number;
  leftCars?: number[];
  rightCars?: number[];
  sticks?: number | number[];
}

export interface HyperspeedOptions {
  onSpeedUp?: (ev: MouseEvent | TouchEvent) => void;
  onSlowDown?: (ev: MouseEvent | TouchEvent) => void;
  distortion?:
    | 'turbulentDistortion'
    | 'turbulentDistortionStill'
    | 'xyDistortion'
    | 'LongRaceDistortion'
    | 'mountainDistortion'
    | 'deepDistortion'
    | 'deepDistortionStill';
  length?: number;
  roadWidth?: number;
  islandWidth?: number;
  lanesPerRoad?: number;
  fov?: number;
  fovSpeedUp?: number;
  speedUp?: number;
  carLightsFade?: number;
  totalSideLightSticks?: number;
  lightPairsPerRoadWay?: number;
  shoulderLinesWidthPercentage?: number;
  brokenLinesWidthPercentage?: number;
  brokenLinesLengthPercentage?: number;
  lightStickWidth?: [number, number];
  lightStickHeight?: [number, number];
  movingAwaySpeed?: [number, number];
  movingCloserSpeed?: [number, number];
  carLightsLength?: [number, number];
  carLightsRadius?: [number, number];
  carWidthPercentage?: [number, number];
  carShiftX?: [number, number];
  carFloorSeparation?: [number, number];
  colors?: HyperspeedColors;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_HYPERSPEED_OPTIONS: Required<Omit<HyperspeedOptions, 'colors'>> & { colors: Required<HyperspeedColors> } = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 6,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808,
    islandColor: 0x0a0a0a,
    background: 0x000000,
    shoulderLines: 0xffffff,
    brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3,
  },
};

// ─── Internal Helpers ─────────────────────────────────────────────────────────

type ResolvedOptions = typeof DEFAULT_HYPERSPEED_OPTIONS & { distortion: DistortionDef };

interface DistortionDef {
  uniforms: Record<string, { value: any }>;
  getDistortion: string;
  getJS?: (progress: number, time: number) => THREE.Vector3;
}

function rnd(base: number | [number, number]): number {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
}

function pickRandom<T>(arr: T | T[]): T {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
}

function lerp(current: number, target: number, speed = 0.1, limit = 0.001): number {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) change = target - current;
  return change;
}

function nsin(val: number): number {
  return Math.sin(val) * 0.5 + 0.5;
}

function resizeCheck(
  renderer: THREE.WebGLRenderer,
  setSize: (w: number, h: number, s: boolean) => void
): boolean {
  const canvas = renderer.domElement;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const needResize = canvas.width !== w || canvas.height !== h;
  if (needResize) setSize(w, h, false);
  return needResize;
}

// ─── Distortion Presets ───────────────────────────────────────────────────────

const mountainUniforms = {
  uFreq: { value: new THREE.Vector3(3, 6, 10) },
  uAmp: { value: new THREE.Vector3(30, 30, 20) },
};
const xyUniforms = {
  uFreq: { value: new THREE.Vector2(5, 2) },
  uAmp: { value: new THREE.Vector2(25, 15) },
};
const longRaceUniforms = {
  uFreq: { value: new THREE.Vector2(2, 3) },
  uAmp: { value: new THREE.Vector2(35, 10) },
};
const turbulentUniforms = {
  uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
  uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
};
const deepUniforms = {
  uFreq: { value: new THREE.Vector2(4, 8) },
  uAmp: { value: new THREE.Vector2(10, 20) },
  uPowY: { value: new THREE.Vector2(20, 2) },
};

const DISTORTIONS: Record<string, DistortionDef> = {
  mountainDistortion: {
    uniforms: mountainUniforms,
    getDistortion: `
      uniform vec3 uAmp; uniform vec3 uFreq;
      #define PI 3.14159265358979
      float nsin(float v){ return sin(v)*0.5+0.5; }
      vec3 getDistortion(float p){
        float fix=0.02;
        return vec3(
          cos(p*PI*uFreq.x+uTime)*uAmp.x - cos(fix*PI*uFreq.x+uTime)*uAmp.x,
          nsin(p*PI*uFreq.y+uTime)*uAmp.y - nsin(fix*PI*uFreq.y+uTime)*uAmp.y,
          nsin(p*PI*uFreq.z+uTime)*uAmp.z - nsin(fix*PI*uFreq.z+uTime)*uAmp.z
        );
      }`,
    getJS: (p, t) => {
      const fix = 0.02, f = mountainUniforms.uFreq.value, a = mountainUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.cos(p*Math.PI*f.x+t)*a.x - Math.cos(fix*Math.PI*f.x+t)*a.x,
        nsin(p*Math.PI*f.y+t)*a.y - nsin(fix*Math.PI*f.y+t)*a.y,
        nsin(p*Math.PI*f.z+t)*a.z - nsin(fix*Math.PI*f.z+t)*a.z
      ).multiply(new THREE.Vector3(2,2,2)).add(new THREE.Vector3(0,0,-5));
    },
  },
  xyDistortion: {
    uniforms: xyUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp;
      #define PI 3.14159265358979
      vec3 getDistortion(float p){
        float fix=0.02;
        return vec3(
          cos(p*PI*uFreq.x+uTime)*uAmp.x - cos(fix*PI*uFreq.x+uTime)*uAmp.x,
          sin(p*PI*uFreq.y+PI/2.+uTime)*uAmp.y - sin(fix*PI*uFreq.y+PI/2.+uTime)*uAmp.y,
          0.
        );
      }`,
    getJS: (p, t) => {
      const fix = 0.02, f = xyUniforms.uFreq.value, a = xyUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.cos(p*Math.PI*f.x+t)*a.x - Math.cos(fix*Math.PI*f.x+t)*a.x,
        Math.sin(p*Math.PI*f.y+t+Math.PI/2)*a.y - Math.sin(fix*Math.PI*f.y+t+Math.PI/2)*a.y,
        0
      ).multiply(new THREE.Vector3(2,0.4,1)).add(new THREE.Vector3(0,0,-3));
    },
  },
  LongRaceDistortion: {
    uniforms: longRaceUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp;
      #define PI 3.14159265358979
      vec3 getDistortion(float p){
        float cam=0.0125;
        return vec3(
          sin(p*PI*uFreq.x+uTime)*uAmp.x - sin(cam*PI*uFreq.x+uTime)*uAmp.x,
          sin(p*PI*uFreq.y+uTime)*uAmp.y - sin(cam*PI*uFreq.y+uTime)*uAmp.y,
          0.
        );
      }`,
    getJS: (p, t) => {
      const cam = 0.0125, f = longRaceUniforms.uFreq.value, a = longRaceUniforms.uAmp.value;
      return new THREE.Vector3(
        Math.sin(p*Math.PI*f.x+t)*a.x - Math.sin(cam*Math.PI*f.x+t)*a.x,
        Math.sin(p*Math.PI*f.y+t)*a.y - Math.sin(cam*Math.PI*f.y+t)*a.y,
        0
      ).multiply(new THREE.Vector3(1,1,0)).add(new THREE.Vector3(0,0,-5));
    },
  },
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq; uniform vec4 uAmp;
      float nsin(float v){ return sin(v)*0.5+0.5; }
      #define PI 3.14159265358979
      float gdX(float p){ return cos(PI*p*uFreq.r+uTime)*uAmp.r + pow(cos(PI*p*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g; }
      float gdY(float p){ return -nsin(PI*p*uFreq.b+uTime)*uAmp.b + -pow(nsin(PI*p*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a; }
      vec3 getDistortion(float p){ return vec3(gdX(p)-gdX(0.0125), gdY(p)-gdY(0.0125), 0.); }`,
    getJS: (p, t) => {
      const f = turbulentUniforms.uFreq.value, a = turbulentUniforms.uAmp.value;
      const gX = (v: number) => Math.cos(Math.PI*v*f.x+t)*a.x + Math.pow(Math.cos(Math.PI*v*f.y+t*(f.y/f.x)),2)*a.y;
      const gY = (v: number) => -nsin(Math.PI*v*f.z+t)*a.z - Math.pow(nsin(Math.PI*v*f.w+t/(f.z/f.w)),5)*a.w;
      return new THREE.Vector3(gX(p)-gX(p+0.007), gY(p)-gY(p+0.007), 0)
        .multiply(new THREE.Vector3(-2,-5,0)).add(new THREE.Vector3(0,0,-10));
    },
  },
  turbulentDistortionStill: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq; uniform vec4 uAmp;
      float nsin(float v){ return sin(v)*0.5+0.5; }
      #define PI 3.14159265358979
      float gdX(float p){ return cos(PI*p*uFreq.r)*uAmp.r + pow(cos(PI*p*uFreq.g*(uFreq.g/uFreq.r)),2.)*uAmp.g; }
      float gdY(float p){ return -nsin(PI*p*uFreq.b)*uAmp.b + -pow(nsin(PI*p*uFreq.a/(uFreq.b/uFreq.a)),5.)*uAmp.a; }
      vec3 getDistortion(float p){ return vec3(gdX(p)-gdX(0.02), gdY(p)-gdY(0.02), 0.); }`,
  },
  deepDistortion: {
    uniforms: deepUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp; uniform vec2 uPowY;
      float nsin(float v){ return sin(v)*0.5+0.5; }
      #define PI 3.14159265358979
      float gdX(float p){ return sin(p*PI*uFreq.x+uTime)*uAmp.x; }
      float gdY(float p){ return pow(abs(p*uPowY.x),uPowY.y) + sin(p*PI*uFreq.y+uTime)*uAmp.y; }
      vec3 getDistortion(float p){ return vec3(gdX(p)-gdX(0.02), gdY(p)-gdY(0.02), 0.); }`,
    getJS: (p, t) => {
      const f = deepUniforms.uFreq.value, a = deepUniforms.uAmp.value, pw = deepUniforms.uPowY.value;
      const gX = (v: number) => Math.sin(v*Math.PI*f.x+t)*a.x;
      const gY = (v: number) => Math.pow(v*pw.x, pw.y) + Math.sin(v*Math.PI*f.y+t)*a.y;
      return new THREE.Vector3(gX(p)-gX(p+0.01), gY(p)-gY(p+0.01), 0)
        .multiply(new THREE.Vector3(-2,-4,0)).add(new THREE.Vector3(0,0,-10));
    },
  },
  deepDistortionStill: {
    uniforms: deepUniforms,
    getDistortion: `
      uniform vec2 uFreq; uniform vec2 uAmp; uniform vec2 uPowY;
      float nsin(float v){ return sin(v)*0.5+0.5; }
      #define PI 3.14159265358979
      float gdX(float p){ return sin(p*PI*uFreq.x)*uAmp.x*2.; }
      float gdY(float p){ return pow(abs(p*uPowY.x),uPowY.y) + sin(p*PI*uFreq.y)*uAmp.y; }
      vec3 getDistortion(float p){ return vec3(gdX(p)-gdX(0.02), gdY(p)-gdY(0.05), 0.); }`,
  },
};

// ─── GLSL Shader Strings ──────────────────────────────────────────────────────

const carLightsFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_fragment']}
  varying vec3 vColor;
  varying vec2 vUv;
  uniform vec2 uFade;
  void main() {
    float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
    gl_FragColor = vec4(vColor, alpha);
    if (gl_FragColor.a < 0.0001) discard;
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const carLightsVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  attribute vec3 aOffset;
  attribute vec3 aMetrics;
  attribute vec3 aColor;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vColor;
  #include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    float radius = aMetrics.r;
    float myLength = aMetrics.g;
    float speed = aMetrics.b;
    transformed.xy *= radius;
    transformed.z *= myLength;
    transformed.z += myLength - mod(uTime * speed + aOffset.z, uTravelLength);
    transformed.xy += aOffset.xy;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    vColor = aColor;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

const sideSticksVertex = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  attribute float aOffset;
  attribute vec3 aColor;
  attribute vec2 aMetrics;
  uniform float uTravelLength;
  uniform float uTime;
  varying vec3 vColor;
  mat4 rotationY(in float a){ return mat4(cos(a),0,sin(a),0, 0,1,0,0, -sin(a),0,cos(a),0, 0,0,0,1); }
  #include <getDistortion_vertex>
  void main(){
    vec3 transformed = position.xyz;
    float width = aMetrics.x;
    float height = aMetrics.y;
    transformed.xy *= vec2(width, height);
    float time = mod(uTime * 120. + aOffset, uTravelLength);
    transformed = (rotationY(3.14/2.) * vec4(transformed,1.)).xyz;
    transformed.z += -uTravelLength + time;
    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);
    transformed.y += height / 2.;
    transformed.x += -width / 2.;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

const sideSticksFragment = `
  #define USE_FOG;
  ${THREE.ShaderChunk['fog_pars_fragment']}
  varying vec3 vColor;
  void main(){
    gl_FragColor = vec4(vColor, 1.);
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const roadVertex = `
  #define USE_FOG;
  uniform float uTime;
  ${THREE.ShaderChunk['fog_pars_vertex']}
  uniform float uTravelLength;
  varying vec2 vUv;
  #include <getDistortion_vertex>
  void main() {
    vec3 transformed = position.xyz;
    vec3 dist = getDistortion((transformed.y + uTravelLength / 2.) / uTravelLength);
    transformed.x += dist.x;
    transformed.z += dist.y;
    transformed.y += -1. * dist.z;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.);
    gl_Position = projectionMatrix * mvPosition;
    vUv = uv;
    ${THREE.ShaderChunk['fog_vertex']}
  }
`;

const roadBaseFragment = `
  #define USE_FOG;
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uTime;
  #include <roadMarkings_vars>
  ${THREE.ShaderChunk['fog_pars_fragment']}
  void main() {
    vec2 uv = vUv;
    vec3 color = vec3(uColor);
    #include <roadMarkings_fragment>
    gl_FragColor = vec4(color, 1.);
    ${THREE.ShaderChunk['fog_fragment']}
  }
`;

const islandFragment = roadBaseFragment
  .replace('#include <roadMarkings_fragment>', '')
  .replace('#include <roadMarkings_vars>', '');

const roadMarkings_vars = `
  uniform float uLanes;
  uniform vec3 uBrokenLinesColor;
  uniform vec3 uShoulderLinesColor;
  uniform float uShoulderLinesWidthPercentage;
  uniform float uBrokenLinesWidthPercentage;
  uniform float uBrokenLinesLengthPercentage;
`;

const roadMarkings_fragment = `
  uv.y = mod(uv.y + uTime * 0.05, 1.);
  float laneWidth = 1.0 / uLanes;
  float brokenLineWidth = laneWidth * uBrokenLinesWidthPercentage;
  float laneEmptySpace = 1. - uBrokenLinesLengthPercentage;
  float brokenLines = step(1.0 - brokenLineWidth, fract(uv.x * 2.0)) * step(laneEmptySpace, fract(uv.y * 10.0));
  float sideLines = step(1.0 - brokenLineWidth, fract((uv.x - laneWidth * (uLanes-1.0)) * 2.0)) + step(brokenLineWidth, uv.x);
  brokenLines = mix(brokenLines, sideLines, uv.x);
`;

const roadFragment = roadBaseFragment
  .replace('#include <roadMarkings_fragment>', roadMarkings_fragment)
  .replace('#include <roadMarkings_vars>', roadMarkings_vars);

// ─── Scene Object Classes ─────────────────────────────────────────────────────

class CarLightsObj {
  mesh!: THREE.Mesh;

  constructor(
    private app: HyperspeedApp,
    private opts: ResolvedOptions,
    private colors: number | number[],
    private speed: [number, number],
    private fade: THREE.Vector2
  ) {}

  init() {
    const { opts } = this;
    const curve = new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1));
    const geometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
    const instanced = new THREE.InstancedBufferGeometry().copy(geometry as any);
    instanced.instanceCount = opts.lightPairsPerRoadWay * 2;

    const laneWidth = opts.roadWidth / opts.lanesPerRoad;
    const aOffset: number[] = [], aMetrics: number[] = [], aColor: number[] = [];

    let colors: THREE.Color | THREE.Color[] = Array.isArray(this.colors)
      ? this.colors.map(c => new THREE.Color(c))
      : new THREE.Color(this.colors);

    for (let i = 0; i < opts.lightPairsPerRoadWay; i++) {
      const radius = rnd(opts.carLightsRadius);
      const length = rnd(opts.carLightsLength);
      const speed  = rnd(this.speed);
      let laneX = (i % opts.lanesPerRoad) * laneWidth - opts.roadWidth / 2 + laneWidth / 2;
      laneX += rnd(opts.carShiftX) * laneWidth;
      const offsetY = rnd(opts.carFloorSeparation) + radius * 1.3;
      const offsetZ = -rnd(opts.length);
      const cw = rnd(opts.carWidthPercentage) * laneWidth;

      aOffset.push(laneX - cw/2, offsetY, offsetZ, laneX + cw/2, offsetY, offsetZ);
      aMetrics.push(radius, length, speed, radius, length, speed);

      const c = pickRandom(colors);
      aColor.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }

    instanced.setAttribute('aOffset',  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),  3, false));
    instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
    instanced.setAttribute('aColor',   new THREE.InstancedBufferAttribute(new Float32Array(aColor),   3, false));

    const mat = new THREE.ShaderMaterial({
      fragmentShader: carLightsFragment,
      vertexShader: carLightsVertex,
      transparent: true,
      uniforms: Object.assign(
        { uTime: { value: 0 }, uTravelLength: { value: opts.length }, uFade: { value: this.fade } },
        this.app.fogUniforms,
        opts.distortion.uniforms
      ),
    });
    mat.onBeforeCompile = s => {
      s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion);
    };

    this.mesh = new THREE.Mesh(instanced, mat);
    this.mesh.frustumCulled = false;
    this.app.scene.add(this.mesh);
  }

  update(time: number) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms['uTime'].value = time;
  }
}

class LightSticksObj {
  mesh!: THREE.Mesh;

  constructor(private app: HyperspeedApp, private opts: ResolvedOptions) {}

  init() {
    const { opts } = this;
    const instanced = new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1) as any);
    instanced.instanceCount = opts.totalSideLightSticks;

    const step = opts.length / (opts.totalSideLightSticks - 1);
    const aOffset: number[] = [], aColor: number[] = [], aMetrics: number[] = [];

    const rawSticks = opts.colors.sticks;
    let colors: THREE.Color | THREE.Color[] = Array.isArray(rawSticks)
      ? (rawSticks as number[]).map(c => new THREE.Color(c))
      : new THREE.Color(rawSticks as number);

    for (let i = 0; i < opts.totalSideLightSticks; i++) {
      aOffset.push((i - 1) * step * 2 + step * Math.random());
      const c = pickRandom(colors);
      aColor.push(c.r, c.g, c.b);
      aMetrics.push(rnd(opts.lightStickWidth), rnd(opts.lightStickHeight));
    }

    instanced.setAttribute('aOffset',  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),  1, false));
    instanced.setAttribute('aColor',   new THREE.InstancedBufferAttribute(new Float32Array(aColor),   3, false));
    instanced.setAttribute('aMetrics', new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false));

    const mat = new THREE.ShaderMaterial({
      fragmentShader: sideSticksFragment,
      vertexShader: sideSticksVertex,
      side: THREE.DoubleSide,
      uniforms: Object.assign(
        { uTravelLength: { value: opts.length }, uTime: { value: 0 } },
        this.app.fogUniforms,
        opts.distortion.uniforms
      ),
    });
    mat.onBeforeCompile = s => {
      s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion);
    };

    this.mesh = new THREE.Mesh(instanced, mat);
    this.mesh.frustumCulled = false;
    this.app.scene.add(this.mesh);
  }

  update(time: number) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms['uTime'].value = time;
  }
}

class RoadObj {
  leftRoadWay!: THREE.Mesh;
  rightRoadWay!: THREE.Mesh;
  island!: THREE.Mesh;
  private uTime = { value: 0 };

  constructor(private app: HyperspeedApp, private opts: ResolvedOptions) {}

  private createPlane(side: number, isRoad: boolean): THREE.Mesh {
    const { opts } = this;
    const geo = new THREE.PlaneGeometry(
      isRoad ? opts.roadWidth : opts.islandWidth,
      opts.length, 20, 100
    );

    let uniforms: Record<string, any> = {
      uTravelLength: { value: opts.length },
      uColor: { value: new THREE.Color(isRoad ? opts.colors.roadColor : opts.colors.islandColor) },
      uTime: this.uTime,
    };

    if (isRoad) {
      Object.assign(uniforms, {
        uLanes:                          { value: opts.lanesPerRoad },
        uBrokenLinesColor:               { value: new THREE.Color(opts.colors.brokenLines) },
        uShoulderLinesColor:             { value: new THREE.Color(opts.colors.shoulderLines) },
        uShoulderLinesWidthPercentage:   { value: opts.shoulderLinesWidthPercentage },
        uBrokenLinesLengthPercentage:    { value: opts.brokenLinesLengthPercentage },
        uBrokenLinesWidthPercentage:     { value: opts.brokenLinesWidthPercentage },
      });
    }

    const mat = new THREE.ShaderMaterial({
      fragmentShader: isRoad ? roadFragment : islandFragment,
      vertexShader: roadVertex,
      side: THREE.DoubleSide,
      uniforms: Object.assign(uniforms, this.app.fogUniforms, opts.distortion.uniforms),
    });
    mat.onBeforeCompile = s => {
      s.vertexShader = s.vertexShader.replace('#include <getDistortion_vertex>', opts.distortion.getDistortion);
    };

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -opts.length / 2;
    mesh.position.x = (opts.islandWidth / 2 + opts.roadWidth / 2) * side;
    this.app.scene.add(mesh);
    return mesh;
  }

  init() {
    this.leftRoadWay  = this.createPlane(-1, true);
    this.rightRoadWay = this.createPlane(1, true);
    this.island       = this.createPlane(0, false);
  }

  update(time: number) { this.uTime.value = time; }
}

// ─── Main App ─────────────────────────────────────────────────────────────────

class HyperspeedApp {
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  fogUniforms!: { fogColor: any; fogNear: any; fogFar: any };

  private renderer!: THREE.WebGLRenderer;
  private composer!: EffectComposer;
  private clock!: THREE.Clock;
  private road!: RoadObj;
  private leftCar!: CarLightsObj;
  private rightCar!: CarLightsObj;
  private sticks!: LightSticksObj;

  private fovTarget: number;
  private speedUpTarget = 0;
  private speedUp = 0;
  private timeOffset = 0;
  private disposed = false;
  private rafId: number | null = null;

  // Bound listeners
  private bMouseDown  = this.onMouseDown.bind(this);
  private bMouseUp    = this.onMouseUp.bind(this);
  private bTouchStart = this.onTouchStart.bind(this);
  private bTouchEnd   = this.onTouchEnd.bind(this);
  private bContext    = (e: Event) => e.preventDefault();
  private bResize     = this.onResize.bind(this);

  constructor(private container: HTMLElement, private opts: ResolvedOptions) {
    this.fovTarget = opts.fov;

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.composer = new EffectComposer(this.renderer);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(opts.fov, container.offsetWidth / container.offsetHeight, 0.1, 10000);
    this.camera.position.set(0, 8, -5);

    this.scene = new THREE.Scene();
    this.scene.background = null;

    const fog = new THREE.Fog(opts.colors.background!, opts.length * 0.2, opts.length * 500);
    this.scene.fog = fog;
    this.fogUniforms = {
      fogColor: { value: fog.color },
      fogNear:  { value: fog.near },
      fogFar:   { value: fog.far },
    };

    this.clock = new THREE.Clock();

    this.road     = new RoadObj(this, opts);
    this.leftCar  = new CarLightsObj(this, opts, opts.colors.leftCars!,  opts.movingAwaySpeed,   new THREE.Vector2(0, 1 - opts.carLightsFade));
    this.rightCar = new CarLightsObj(this, opts, opts.colors.rightCars!, opts.movingCloserSpeed, new THREE.Vector2(1, 0 + opts.carLightsFade));
    this.sticks   = new LightSticksObj(this, opts);

    window.addEventListener('resize', this.bResize);
  }

  private onResize() {
    const w = this.container.offsetWidth, h = this.container.offsetHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(w, h);
  }

  private initPasses() {
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass  = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.2, luminanceSmoothing: 0, resolutionScale: 1 }));
    const smaaPass   = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM }));
    renderPass.renderToScreen = false;
    bloomPass.renderToScreen  = false;
    smaaPass.renderToScreen   = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
    this.composer.addPass(smaaPass);
  }

  loadAssets(): Promise<void> {
    return Promise.resolve();
  }

  init() {
    this.initPasses();
    const { opts } = this;

    this.road.init();

    this.leftCar.init();
    this.leftCar.mesh.position.setX(-opts.roadWidth / 2 - opts.islandWidth / 2);

    this.rightCar.init();
    this.rightCar.mesh.position.setX(opts.roadWidth / 2 + opts.islandWidth / 2);

    this.sticks.init();
    this.sticks.mesh.position.setX(-(opts.roadWidth + opts.islandWidth / 2));

    this.container.addEventListener('mousedown',    this.bMouseDown);
    this.container.addEventListener('mouseup',      this.bMouseUp);
    this.container.addEventListener('mouseout',     this.bMouseUp);
    this.container.addEventListener('touchstart',   this.bTouchStart, { passive: true });
    this.container.addEventListener('touchend',     this.bTouchEnd,   { passive: true });
    this.container.addEventListener('touchcancel',  this.bTouchEnd,   { passive: true });
    this.container.addEventListener('contextmenu',  this.bContext);

    this.tick();
  }

  private onMouseDown(ev: MouseEvent) {
    this.opts.onSpeedUp?.(ev);
    this.fovTarget    = this.opts.fovSpeedUp;
    this.speedUpTarget = this.opts.speedUp;
  }
  private onMouseUp(ev: MouseEvent) {
    this.opts.onSlowDown?.(ev);
    this.fovTarget    = this.opts.fov;
    this.speedUpTarget = 0;
  }
  private onTouchStart(ev: TouchEvent) {
    this.opts.onSpeedUp?.(ev);
    this.fovTarget    = this.opts.fovSpeedUp;
    this.speedUpTarget = this.opts.speedUp;
  }
  private onTouchEnd(ev: TouchEvent) {
    this.opts.onSlowDown?.(ev);
    this.fovTarget    = this.opts.fov;
    this.speedUpTarget = 0;
  }

  private update(delta: number) {
    const lp = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp  += lerp(this.speedUp, this.speedUpTarget, lp, 0.00001);
    this.timeOffset += this.speedUp * delta;

    const time = this.clock.elapsedTime + this.timeOffset;
    this.rightCar.update(time);
    this.leftCar.update(time);
    this.sticks.update(time);
    this.road.update(time);

    let camDirty = false;
    const fovDelta = lerp(this.camera.fov, this.fovTarget, lp);
    if (fovDelta !== 0) { this.camera.fov += fovDelta * delta * 6; camDirty = true; }

    if (this.opts.distortion.getJS) {
      const d = this.opts.distortion.getJS(0.025, time);
      this.camera.lookAt(
        this.camera.position.x + d.x,
        this.camera.position.y + d.y,
        this.camera.position.z + d.z
      );
      camDirty = true;
    }

    if (camDirty) this.camera.updateProjectionMatrix();
  }

  private tick() {
    if (this.disposed) return;
    if (resizeCheck(this.renderer, (w, h, s) => this.composer.setSize(w, h, s))) {
      const c = this.renderer.domElement;
      this.camera.aspect = c.clientWidth / c.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    const delta = this.clock.getDelta();
    this.composer.render(delta);
    this.update(delta);
    this.rafId = requestAnimationFrame(() => this.tick());
  }

  dispose() {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    this.renderer.dispose();
    this.composer.dispose();
    this.scene.clear();

    window.removeEventListener('resize', this.bResize);
    this.container.removeEventListener('mousedown',   this.bMouseDown);
    this.container.removeEventListener('mouseup',     this.bMouseUp);
    this.container.removeEventListener('mouseout',    this.bMouseUp);
    this.container.removeEventListener('touchstart',  this.bTouchStart);
    this.container.removeEventListener('touchend',    this.bTouchEnd);
    this.container.removeEventListener('touchcancel', this.bTouchEnd);
    this.container.removeEventListener('contextmenu', this.bContext);

    const canvas = this.renderer.domElement;
    canvas.parentNode?.removeChild(canvas);
  }
}

// ─── Angular Component ────────────────────────────────────────────────────────

@Component({
  selector: 'app-hyperspeed',
  standalone: true,
  template: `<div #lights class="hyperspeed-container"></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
    .hyperspeed-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: absolute;
    }
    :host ::ng-deep canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `],
})
export class HyperspeedComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('lights') lightsRef!: ElementRef<HTMLDivElement>;

  /**
   * Pass any subset of HyperspeedOptions to override defaults.
   *
   * @example
   * <app-hyperspeed [effectOptions]="{ distortion: 'deepDistortion', speedUp: 3 }"></app-hyperspeed>
   */
  @Input() effectOptions: HyperspeedOptions = {};

  private app: HyperspeedApp | null = null;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initApp();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['effectOptions'] && !changes['effectOptions'].firstChange) {
      this.destroyApp();
      this.initApp();
    }
  }

  ngOnDestroy(): void {
    this.destroyApp();
  }

  private buildOptions(): ResolvedOptions {
    const merged = {
      ...DEFAULT_HYPERSPEED_OPTIONS,
      ...this.effectOptions,
      colors: { ...DEFAULT_HYPERSPEED_OPTIONS.colors, ...this.effectOptions.colors },
    };

    const distortionKey = (merged.distortion as string) || 'turbulentDistortion';
    const distortion = DISTORTIONS[distortionKey] ?? DISTORTIONS['turbulentDistortion'];

    return { ...merged, distortion } as ResolvedOptions;
  }

  private initApp(): void {
    if (!this.lightsRef) return;
    const container = this.lightsRef.nativeElement;
    const options = this.buildOptions();

    // Run outside Angular zone — avoids triggering CD on every rAF tick
    this.ngZone.runOutsideAngular(() => {
      this.app = new HyperspeedApp(container, options);
      this.app.loadAssets().then(() => this.app?.init());
    });
  }

  private destroyApp(): void {
    this.app?.dispose();
    this.app = null;
  }
}