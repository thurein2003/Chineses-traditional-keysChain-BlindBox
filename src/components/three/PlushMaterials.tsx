"use client";
import { useEffect, useMemo, useContext, createContext } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  CanvasTexture,
  RepeatWrapping,
  Vector3,
  CatmullRomCurve3,
  Color,
  SRGBColorSpace,
  DoubleSide,
  type Vector3Tuple,
} from "three";
export const PlushQuality = createContext(1);
export type Profile = "head" | "body" | "paw" | "ear" | "muzzle" | "leaf";
function random(seed: number) {
  let state = seed | 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
let fabric: CanvasTexture | undefined;
export function fabricTexture() {
  if (fabric) return fabric;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d")!,
    rng = random(82531);
  context.fillStyle = "#eeeeee";
  context.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 32000; i++) {
    const n = Math.floor(190 + rng() * 65);
    context.strokeStyle = `rgb(${n},${n},${n})`;
    const x = rng() * 512,
      y = rng() * 512;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + (rng() - 0.5) * 3, y + 1 + rng() * 5);
    context.stroke();
  }
  fabric = new CanvasTexture(canvas);
  fabric.wrapS = fabric.wrapT = RepeatWrapping;
  fabric.anisotropy = 4;
  return fabric;
}
function surface(
  theta: number,
  phi: number,
  size: Vector3Tuple,
  profile: Profile,
) {
  const y = Math.cos(theta),
    r = Math.sin(theta),
    signed = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);
  let x = r * Math.cos(phi),
    z = r * Math.sin(phi),
    h = y;
  if (profile === "head") {
    x = signed(x, 0.86) * (1 + 0.12 * Math.exp(-((y + 0.28) ** 2) / 0.18));
    z = signed(z, 0.94);
    h = signed(y, 0.94);
  }
  if (profile === "body") {
    x *= 0.86 - 0.15 * y;
    z *= 0.9 - 0.1 * y;
    h = signed(y, 0.9);
  }
  if (profile === "paw") {
    x = signed(x, 0.85);
    z = signed(z, 0.84);
    h = y < -0.55 ? -0.55 + (y + 0.55) * 0.56 : y;
  }
  if (profile === "ear") {
    x *= 0.88 - 0.2 * y;
    z *= 0.82 + 0.12 * y;
  }
  if (profile === "muzzle") {
    x = signed(x, 0.8);
    h = signed(y, 0.87);
    z = signed(z, 0.84);
  }
  if (profile === "leaf") {
    x *= 0.7 - 0.35 * y;
    z *= 0.78 - 0.15 * y;
  }
  const ripple =
    1 + 0.007 * Math.sin(phi * 7 + theta * 4) * Math.sin(theta * 9);
  return new Vector3(x * size[0] * ripple, h * size[1], z * size[2] * ripple);
}
export function createPlushGeometry(
  size: Vector3Tuple,
  profile: Profile,
  fibers: number,
  length: number,
) {
  const width = 48,
    height = 32,
    positions: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  for (let j = 0; j <= height; j++)
    for (let i = 0; i <= width; i++) {
      positions.push(
        ...surface(
          (j / height) * Math.PI,
          (i / width) * Math.PI * 2,
          size,
          profile,
        ).toArray(),
      );
      uv.push((i / width) * 4, (j / height) * 3);
    }
  for (let j = 0; j < height; j++)
    for (let i = 0; i < width; i++) {
      const a = j * (width + 1) + i,
        b = a + width + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  const body = new BufferGeometry();
  body.setAttribute("position", new Float32BufferAttribute(positions, 3));
  body.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  body.setIndex(indices);
  body.computeVertexNormals();
  const fp: number[] = [],
    fn: number[] = [],
    fc: number[] = [],
    fi: number[] = [],
    rng = random(1699 + Math.round(size[0] * 900 + size[1] * 300));
  const up = new Vector3(0, 1, 0);
  for (let i = 0; i < fibers; i++) {
    const theta = Math.acos(1 - 2 * rng()),
      phi = rng() * Math.PI * 2,
      p = surface(theta, phi, size, profile);
    const normal = new Vector3(
      p.x / size[0] ** 2,
      p.y / size[1] ** 2,
      p.z / size[2] ** 2,
    ).normalize();
    const tangent = new Vector3()
      .crossVectors(
        normal,
        Math.abs(normal.y) > 0.95 ? new Vector3(1, 0, 0) : up,
      )
      .normalize();
    const bitangent = new Vector3().crossVectors(normal, tangent).normalize();
    const angle = rng() * Math.PI * 2,
      dir = tangent
        .clone()
        .multiplyScalar(Math.cos(angle))
        .addScaledVector(bitangent, Math.sin(angle));
    const l = length * (0.65 + rng() * 0.7),
      tip = p
        .clone()
        .addScaledVector(normal, l)
        .addScaledVector(dir, l * 0.38),
      shade = 0.85 + rng() * 0.15;
    for (let ribbon = 0; ribbon < 2; ribbon++) {
      const side = ribbon
        ? new Vector3().crossVectors(normal, dir).normalize()
        : dir;
      const w = 0.0005 + rng() * 0.0007,
        start = fp.length / 3;
      const points = [
        p.clone().addScaledVector(side, -w),
        p.clone().addScaledVector(side, w),
        tip.clone().addScaledVector(side, w * 0.12),
        tip.clone().addScaledVector(side, -w * 0.12),
      ];
      for (const point of points) {
        fp.push(...point.toArray());
        fn.push(...normal.toArray());
        fc.push(shade, shade, shade);
      }
      fi.push(start, start + 1, start + 2, start, start + 2, start + 3);
    }
  }
  const fur = new BufferGeometry();
  fur.setAttribute("position", new Float32BufferAttribute(fp, 3));
  fur.setAttribute("normal", new Float32BufferAttribute(fn, 3));
  fur.setAttribute("color", new Float32BufferAttribute(fc, 3));
  fur.setIndex(fi);
  fur.computeBoundingSphere();
  return { body, fur };
}
export function Plush({
  size,
  profile = "head",
  position,
  rotation,
  color,
  fibers = 450,
  length = 0.022,
}: {
  size: Vector3Tuple;
  profile?: Profile;
  position?: Vector3Tuple;
  rotation?: Vector3Tuple;
  color: string;
  fibers?: number;
  length?: number;
}) {
  const [x, y, z] = size;
  const density = useContext(PlushQuality),
    count = Math.round(fibers * density);
  const geometry = useMemo(
    () => createPlushGeometry([x, y, z], profile, count, length),
    [x, y, z, profile, count, length],
  );
  const texture = useMemo(() => fabricTexture(), []);
  const sheen = useMemo(
    () => new Color(color).lerp(new Color("#fff7e9"), 0.18),
    [color],
  );
  useEffect(
    () => () => {
      geometry.body.dispose();
      geometry.fur.dispose();
    },
    [geometry],
  );
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry.body}>
        <meshPhysicalMaterial
          color={color}
          roughness={0.96}
          bumpMap={texture}
          bumpScale={0.013}
          sheen={0.75}
          sheenRoughness={0.88}
          sheenColor={sheen}
        />
      </mesh>
      {fibers > 0 && (
        <mesh geometry={geometry.fur}>
          <meshStandardMaterial
            color={color}
            vertexColors
            roughness={1}
            emissive={color}
            emissiveIntensity={0.12}
            side={DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
export function Thread({
  points,
  color = "#956b50",
  radius = 0.006,
}: {
  points: Vector3Tuple[];
  color?: string;
  radius?: number;
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry
        args={[curve, Math.max(16, points.length * 6), radius, 6, false]}
      />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
export function Seam({
  points,
  color = "#ad8c77",
}: {
  points: Vector3Tuple[];
  color?: string;
}) {
  const positions = useMemo(() => {
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
    const result: number[] = [];
    for (let i = 0; i < 35; i++) {
      result.push(
        ...curve.getPoint(i / 35).toArray(),
        ...curve.getPoint((i + 0.46) / 35).toArray(),
      );
    }
    return new Float32Array(result);
  }, [points]);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} />
    </lineSegments>
  );
}
export function Label({
  text,
  color = "#6c3e1c",
  size = 0.35,
  position = [0, 0, 0],
}: {
  text: string;
  color?: string;
  size?: number;
  position?: Vector3Tuple;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, 512, 512);
    ctx.fillStyle = color;
    ctx.font = '360px "Songti SC", "Noto Serif CJK SC", serif';
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(text, 256, 279);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={position}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
