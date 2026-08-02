'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, MeshTransmissionMaterial, RoundedBox } from '@react-three/drei';
import { type RefObject, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const FULL_ROTATION_SECONDS = 60;
const MAX_TILT_RADIANS = THREE.MathUtils.degToRad(4);
/** The slab never sits face-on to the camera — a standing three-quarter read is the architectural one. */
const BASE_YAW_RADIANS = THREE.MathUtils.degToRad(24);

const SLAB_WIDTH = 1.02;
const SLAB_HEIGHT = 2.05;
const SLAB_DEPTH = 0.36;
const FLOOR_Y = -SLAB_HEIGHT / 2;

/**
 * The strata live in the backdrop the glass transmits, not in bright meshes inside it — lit bars
 * inside glass read as neon, a refracted gradient reads as depth.
 *
 * These stops are deliberately NEUTRAL grey. The chamber already casts a strong indigo through the
 * glass; tinting the backdrop indigo as well stacks blue on blue and pins saturation at 100%, which
 * is what made earlier passes read as electric royal blue instead of smoky indigo-grey.
 */
const BACKDROP_STOPS: ReadonlyArray<readonly [number, string]> = [
  [0, '#33333a'],
  [0.09, '#dcdce5'],
  [0.17, '#676772'],
  [0.33, '#c2c2cc'],
  [0.41, '#45454f'],
  [0.57, '#d2d2db'],
  [0.67, '#4f4f59'],
  [0.81, '#a2a2ad'],
  [0.91, '#38383f'],
  [1, '#252529'],
];

/** Dark inclusions that give the refraction something with parallax to bend. */
const INCLUSIONS = [
  { y: -0.52, height: 0.045 },
  { y: 0.12, height: 0.03 },
  { y: 0.66, height: 0.055 },
] as const;

type PointerPosition = { x: number; y: number };

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);

    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return reducedMotion;
}

/** Aims the camera at the slab's midriff so the object reads as taller than the viewer. */
function CameraRig() {
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    camera.lookAt(0, -0.06, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

/**
 * The ground pool. Alpha lives in the texture itself rather than in an `alphaMap`, so it genuinely
 * reaches zero well inside the disc — an alpha ramp that is still faintly opaque at the rim draws a
 * visible arc across the frame, which is invisible on the dark page but obvious over transparency.
 */
function useGroundPool(): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const context = canvas.getContext('2d');
    if (!context) return null;

    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(26, 23, 71, 0.95)');
    gradient.addColorStop(0.3, 'rgba(21, 19, 58, 0.6)');
    gradient.addColorStop(0.6, 'rgba(15, 13, 42, 0.2)');
    gradient.addColorStop(0.85, 'rgba(9, 8, 28, 0)');
    gradient.addColorStop(1, 'rgba(9, 8, 28, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

/**
 * Transmission samples the rendered scene, and on a transparent canvas that scene is empty black —
 * which is why an unlit slab renders as a dead prism no matter how bright the environment is.
 * drei swaps this in as the scene background for the transmission pass only, so the glass gets
 * something indigo to carry while the canvas itself stays transparent.
 */
function useBackdrop(): THREE.CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;

    const width = 8;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) return null;

    const gradient = context.createLinearGradient(0, 0, 0, height);
    for (const [offset, colour] of BACKDROP_STOPS) gradient.addColorStop(offset, colour);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function Monolith({
  pointer,
  reducedMotion,
}: {
  pointer: RefObject<PointerPosition>;
  reducedMotion: boolean;
}) {
  const monolith = useRef<THREE.Group>(null);
  const backdrop = useBackdrop();

  useFrame(({ clock }, delta) => {
    if (!monolith.current) return;

    const targetX = reducedMotion ? 0 : -pointer.current.y * MAX_TILT_RADIANS;
    const targetZ = reducedMotion ? 0 : pointer.current.x * MAX_TILT_RADIANS;

    monolith.current.rotation.x = THREE.MathUtils.damp(monolith.current.rotation.x, targetX, 3, delta);
    monolith.current.rotation.z = THREE.MathUtils.damp(monolith.current.rotation.z, targetZ, 3, delta);

    if (!reducedMotion) {
      monolith.current.rotation.y =
        BASE_YAW_RADIANS + (clock.getElapsedTime() / FULL_ROTATION_SECONDS) * Math.PI * 2;
    }
  });

  return (
    <group ref={monolith} rotation={[0, BASE_YAW_RADIANS, 0]}>
      {INCLUSIONS.map(({ y, height }) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[SLAB_WIDTH - 0.13, height, SLAB_DEPTH - 0.13]} />
          <meshStandardMaterial color="#12103a" metalness={0} roughness={1} />
        </mesh>
      ))}

      {/* Chiselled shell. The indigo is absorption over path length, not paint — a near-neutral
          tint plus a short attenuation distance is what makes thick edges read as deep glass. */}
      <RoundedBox args={[SLAB_WIDTH, SLAB_HEIGHT, SLAB_DEPTH]} radius={0.022} smoothness={4}>
        <MeshTransmissionMaterial
          backside
          backsideResolution={256}
          backsideThickness={0.45}
          background={backdrop ?? undefined}
          resolution={512}
          samples={6}
          transmission={1}
          thickness={1.1}
          ior={1.55}
          chromaticAberration={0.06}
          anisotropicBlur={0.25}
          distortion={0.16}
          distortionScale={0.32}
          temporalDistortion={0}
          roughness={0.11}
          clearcoat={0.3}
          clearcoatRoughness={0.22}
          color="#dfe1f0"
          attenuationColor="#818cf8"
          attenuationDistance={3.2}
        />
      </RoundedBox>
    </group>
  );
}

/**
 * A locally-constructed chamber. Lightformers mean no HDRI fetch: the environment is deterministic,
 * offline-safe, and is the only thing the glass has to reflect.
 */
function Chamber() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={1.3}>
      {/* Neutral, not indigo — the chamber's colour comes from the lightformers, and a blue base
          here would double up and crush the red channel to zero. */}
      <color args={['#101014']} attach="background" />
      {/* One large soft key, upper-left. */}
      <Lightformer
        color="#eef2ff"
        form="rect"
        intensity={2.6}
        position={[-5, 4, 4]}
        rotation-y={Math.PI / 3.2}
        scale={[8, 9, 1]}
      />
      {/* Cool violet rim. Sits behind and to the right so it grazes the right silhouette rather
          than washing the face. */}
      <Lightformer
        color="#818cf8"
        form="rect"
        intensity={6}
        position={[3.2, 0.4, -2.6]}
        rotation-y={-Math.PI / 1.7}
        scale={[0.8, 9, 1]}
      />
      {/* Indigo back fill so the slab's core carries colour instead of going to void. */}
      <Lightformer color="#4f46e5" form="rect" intensity={1.6} position={[0, 1.5, -7]} scale={[10, 10, 1]} />
      {/* Dim bounce keeps the base from dying. */}
      <Lightformer
        color="#6366f1"
        form="rect"
        intensity={0.5}
        position={[0, -4, 1]}
        rotation-x={-Math.PI / 2}
        scale={[10, 10, 1]}
      />
    </Environment>
  );
}

/** Unlit on purpose: the pool is a compositing element, not a surface the chamber should relight. */
function GroundPool() {
  const pool = useGroundPool();
  if (!pool) return null;

  return (
    <mesh position={[0, FLOOR_Y - 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[4.6, 64]} />
      <meshBasicMaterial depthWrite={false} map={pool} toneMapped={false} transparent />
    </mesh>
  );
}

function HeroMonolithScene({
  reducedMotion,
  pointer,
}: {
  reducedMotion: boolean;
  pointer: RefObject<PointerPosition>;
}) {
  return (
    <>
      <CameraRig />
      <Chamber />

      <ambientLight intensity={0.15} />
      {/* No cast shadow: the grounding is the contact shadow, and a hard directional slab reads cheap. */}
      <directionalLight color="#eef2ff" intensity={1.1} position={[-4.5, 6, 3.5]} />

      <Monolith pointer={pointer} reducedMotion={reducedMotion} />

      <GroundPool />
      <ContactShadows
        blur={2.4}
        color="#000106"
        far={1.15}
        opacity={1}
        position={[0, FLOOR_Y - 0.002, 0]}
        resolution={512}
        scale={3.2}
      />
    </>
  );
}

/** A transparent, desktop-sized WebGL scene for the LoudFace monolith artifact. */
export function HeroMonolith() {
  const reducedMotion = useReducedMotion();
  const pointer = useRef<PointerPosition>({ x: 0, y: 0 });

  return (
    <div
      className="h-full w-full"
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
          y: ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
        };
      }}
    >
      <Canvas
        aria-hidden="true"
        camera={{ fov: 30, position: [1.1, 0.5, 5] }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <HeroMonolithScene pointer={pointer} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
