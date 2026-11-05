"use client";
import { useMemo } from "react";
import {
  CatmullRomCurve3,
  Vector3,
  Vector2,
  Shape,
  type Vector3Tuple,
} from "three";
import type { Zodiac } from "@/data/zodiac";
import { Plush, Thread, Seam, Label } from "./PlushMaterials";
const GOLD = "#dfaf4f",
  CREAM = "#fff0d9",
  CORD = "#b51228";
function Bead({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = GOLD,
  metal = false,
}: {
  position?: Vector3Tuple;
  size?: Vector3Tuple;
  color?: string;
  metal?: boolean;
}) {
  return (
    <mesh position={position} scale={size}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshPhysicalMaterial
        color={color}
        metalness={metal ? 0.86 : 0}
        roughness={metal ? 0.22 : 0.13}
        clearcoat={metal ? 0.35 : 1}
        clearcoatRoughness={0.09}
      />
    </mesh>
  );
}
function Loop({
  position = [0, 0, 0],
  radius = 0.1,
  tube = 0.025,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = GOLD,
}: {
  position?: Vector3Tuple;
  radius?: number;
  tube?: number;
  rotation?: Vector3Tuple;
  scale?: Vector3Tuple;
  color?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <torusGeometry args={[radius, tube, 12, 64]} />
      <meshStandardMaterial
        color={color}
        metalness={color === CORD ? 0 : 0.87}
        roughness={color === CORD ? 0.9 : 0.23}
      />
    </mesh>
  );
}
function GoldCurve({
  points,
  radius = 0.035,
  color = GOLD,
}: {
  points: Vector3Tuple[];
  radius?: number;
  color?: string;
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 40, radius, 10, false]} />
        <meshStandardMaterial
          color={color}
          metalness={color === GOLD ? 0.84 : 0}
          roughness={color === GOLD ? 0.24 : 0.9}
        />
      </mesh>
      {[points[0], points[points.length - 1]].map((position, i) => (
        <mesh key={i} position={position}>
          <sphereGeometry args={[radius, 16, 12]} />
          <meshStandardMaterial
            color={color}
            metalness={color === GOLD ? 0.84 : 0}
            roughness={color === GOLD ? 0.24 : 0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
function Pouch({
  position = [0, -0.31, 0.55],
  small = false,
}: {
  position?: Vector3Tuple;
  small?: boolean;
}) {
  return (
    <group position={position} scale={small ? 0.8 : 1}>
      <Plush
        size={[0.26, 0.29, 0.145]}
        profile="body"
        color="#bc1930"
        fibers={800}
        length={0.012}
      />
      <Plush
        size={[0.15, 0.1, 0.1]}
        position={[0, 0.26, 0]}
        color="#c92439"
        fibers={240}
        length={0.01}
      />
      {[-1, 1].map((s) => (
        <Thread
          key={s}
          color={GOLD}
          radius={0.012}
          points={[
            [0, 0.23, 0.13],
            [s * 0.13, 0.34, 0.13],
            [s * 0.2, 0.27, 0.12],
            [s * 0.08, 0.22, 0.15],
            [0, 0.23, 0.15],
            [s * 0.12, 0.13, 0.15],
          ]}
        />
      ))}
      <Label
        text="福"
        color="#f6d481"
        size={0.29}
        position={[0, -0.015, 0.154]}
      />
      <Seam
        points={[
          [-0.19, -0.13, 0.11],
          [-0.12, -0.24, 0.12],
          [0, -0.27, 0.13],
          [0.12, -0.24, 0.12],
          [0.19, -0.13, 0.11],
        ]}
        color="#e65657"
      />
    </group>
  );
}
function Ingot({ position = [0, -0.12, 0.65] }: { position?: Vector3Tuple }) {
  const profile = useMemo(
    () => [
      new Vector2(0, -0.11),
      new Vector2(0.12, -0.1),
      new Vector2(0.22, -0.02),
      new Vector2(0.27, 0.07),
      new Vector2(0.28, 0.105),
    ],
    [],
  );
  return (
    <group position={position}>
      <mesh scale={[1.2, 0.9, 0.65]}>
        <latheGeometry args={[profile, 48]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.9}
          roughness={0.2}
          side={2}
        />
      </mesh>
      <Loop
        radius={0.278}
        tube={0.016}
        position={[0, 0.096, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.2, 0.65, 1]}
      />
      <Bead position={[0, 0.06, 0]} size={[0.14, 0.14, 0.11]} metal />
      {[-1, 1].map((s) => (
        <GoldCurve
          key={s}
          points={[
            [s * 0.19, 0.04, 0],
            [s * 0.29, 0.11, 0],
            [s * 0.35, 0.15, 0],
          ]}
          radius={0.022}
        />
      ))}
    </group>
  );
}
function Bone() {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.22, 0.05);
    s.bezierCurveTo(-0.42, 0.28, -0.46, 0.02, -0.31, -0.03);
    s.bezierCurveTo(-0.44, -0.18, -0.25, -0.25, -0.19, -0.08);
    s.lineTo(0.19, -0.08);
    s.bezierCurveTo(0.25, -0.25, 0.44, -0.18, 0.31, -0.03);
    s.bezierCurveTo(0.46, 0.02, 0.42, 0.28, 0.22, 0.05);
    s.closePath();
    return s;
  }, []);
  return (
    <group position={[0, -0.16, 0.65]} rotation={[0, 0, -0.18]}>
      <mesh>
        <extrudeGeometry
          args={[
            shape,
            {
              depth: 0.09,
              bevelEnabled: true,
              bevelSegments: 5,
              steps: 1,
              bevelSize: 0.035,
              bevelThickness: 0.035,
            },
          ]}
        />
        <meshPhysicalMaterial color="#fff5e3" roughness={0.95} sheen={1} />
      </mesh>
      <Seam
        color="#cfbc9e"
        points={[
          [-0.2, -0.025, 0.13],
          [0, -0.025, 0.13],
          [0.2, -0.025, 0.13],
        ]}
      />
    </group>
  );
}
function Cloud() {
  return (
    <group position={[0, -0.55, 0.53]}>
      {[-1, 0, 1].map((s) => (
        <Plush
          key={s}
          position={[s * 0.15, s === 0 ? 0.04 : 0, 0]}
          size={[0.17, 0.13, 0.06]}
          color="#ffe5bc"
          fibers={100}
          length={0.007}
        />
      ))}
      <Thread
        color={GOLD}
        radius={0.014}
        points={[
          [-0.25, -0.02, 0.08],
          [-0.26, 0.08, 0.08],
          [-0.18, 0.1, 0.08],
          [-0.13, 0.03, 0.08],
          [-0.18, -0.02, 0.08],
          [-0.2, 0.03, 0.08],
        ]}
      />
      <Thread
        color={GOLD}
        radius={0.014}
        points={[
          [0.25, -0.02, 0.08],
          [0.26, 0.08, 0.08],
          [0.18, 0.1, 0.08],
          [0.13, 0.03, 0.08],
          [0.18, -0.02, 0.08],
          [0.2, 0.03, 0.08],
        ]}
      />
    </group>
  );
}
function Accessory({ animal }: { animal: Zodiac }) {
  const id = animal.id;
  if (["ox", "goat", "pig"].includes(id)) return <Pouch />;
  if (id === "rat")
    return (
      <>
        <Pouch position={[0, -0.43, 0.46]} small />
        <Ingot position={[0, -0.11, 0.65]} />
      </>
    );
  if (id === "rooster") return <Ingot />;
  if (id === "dog") return <Bone />;
  if (id === "rabbit")
    return (
      <group position={[0, -0.18, 0.62]} rotation={[0, 0, -0.43]}>
        <Plush
          size={[0.15, 0.3, 0.13]}
          profile="leaf"
          color="#e9892f"
          fibers={600}
          length={0.01}
          rotation={[0, 0, Math.PI]}
        />
        {[-1, 0, 1].map((i) => (
          <Plush
            key={i}
            position={[i * 0.07, 0.29, 0]}
            size={[0.055, 0.17, 0.035]}
            rotation={[0, 0, -i * 0.4]}
            profile="leaf"
            color="#6d8d46"
            fibers={120}
            length={0.01}
          />
        ))}
        {[-1, 0, 1].map((i) => (
          <Thread
            key={i}
            color="#c86b25"
            radius={0.006}
            points={[
              [-0.08, 0.1 + i * 0.1, 0.112],
              [0, 0.08 + i * 0.1, 0.132],
              [0.07, 0.06 + i * 0.1, 0.112],
            ]}
          />
        ))}
      </group>
    );
  if (id === "dragon")
    return (
      <>
        <group position={[0, -0.12, 0.68]}>
          <mesh>
            <sphereGeometry args={[0.235, 48, 32]} />
            <meshPhysicalMaterial
              color="#fff3df"
              roughness={0.12}
              metalness={0.12}
              clearcoat={1}
              iridescence={0.4}
              iridescenceIOR={1.3}
            />
          </mesh>
          <Loop
            position={[0, -0.205, 0]}
            radius={0.1}
            tube={0.02}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>
        <Cloud />
      </>
    );
  if (id === "horse")
    return (
      <group position={[0, -0.18, 0.68]}>
        <GoldCurve
          points={Array.from({ length: 21 }, (_, i) => {
            const a = Math.PI * 0.7 + (i / 20) * Math.PI * 1.6;
            return [Math.cos(a) * 0.235, Math.sin(a) * 0.25, 0] as Vector3Tuple;
          })}
          radius={0.055}
        />
        {Array.from({ length: 9 }, (_, i) => {
          const a = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
          return (
            <Bead
              key={i}
              position={[Math.cos(a) * 0.235, Math.sin(a) * 0.25, 0.05]}
              size={[0.02, 0.02, 0.014]}
              color="#fff0b4"
              metal
            />
          );
        })}
      </group>
    );
  if (id === "monkey")
    return (
      <group position={[0, -0.18, 0.66]} rotation={[0, 0, -0.3]}>
        {[-1, 0, 1].map((i) => (
          <group key={i}>
            <GoldCurve
              color="#e9bd42"
              radius={0.052}
              points={[
                [0.09 + i * 0.06, 0.23, 0],
                [0.13 + i * 0.065, 0.1, 0],
                [0.06 + i * 0.08, -0.12, 0.03],
                [-0.11 + i * 0.06, -0.19, 0.02],
              ]}
            />
            <Bead
              position={[-0.11 + i * 0.06, -0.19, 0.02]}
              size={[0.03, 0.025, 0.03]}
              color="#8b5d2c"
            />
          </group>
        ))}
      </group>
    );
  if (id === "snake")
    return (
      <group position={[0, -0.15, 0.66]}>
        <Bead size={[0.17, 0.19, 0.14]} metal />
        <Bead position={[0, 0.21, 0]} size={[0.105, 0.12, 0.1]} metal />
        <Loop position={[0, 0.32, 0]} radius={0.035} tube={0.015} />
        <Loop
          position={[0, 0.1, 0]}
          radius={0.105}
          tube={0.012}
          color={CORD}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </group>
    );
  return (
    <group position={[0, -0.17, 0.68]} rotation={[0, 0, -0.25]}>
      <Plush
        size={[0.29, 0.18, 0.1]}
        profile="body"
        color="#d52d31"
        fibers={550}
        length={0.009}
      />
      <Plush
        position={[-0.32, 0, 0]}
        size={[0.12, 0.16, 0.045]}
        color="#ed9c36"
        rotation={[0, 0, Math.PI / 2]}
        fibers={150}
        length={0.01}
      />
      <Bead
        position={[0.16, 0.055, 0.105]}
        size={[0.052, 0.056, 0.025]}
        color="#fff4d1"
      />
      <Bead
        position={[0.17, 0.06, 0.13]}
        size={[0.028, 0.034, 0.015]}
        color="#2c1a12"
      />
      {[-1, 0, 1].map((i) => (
        <Thread
          key={i}
          color="#f1c45d"
          radius={0.009}
          points={[
            [i * 0.075 - 0.04, 0.08, 0.1],
            [i * 0.075, -0.02, 0.112],
            [i * 0.075 + 0.03, -0.1, 0.09],
          ]}
        />
      ))}
    </group>
  );
}
function Hardware({ animal }: { animal: Zodiac }) {
  const rise = animal.id === "rabbit" ? 0.4 : 0;
  const chain = useMemo(() => {
    const curve = new CatmullRomCurve3([
      new Vector3(0.21, 1.54 + rise, 0),
      new Vector3(0.5, 1.18 + rise * 0.65, 0),
      new Vector3(0.85, 0.7 + rise * 0.2, 0),
      new Vector3(0.89, 0.48, 0),
    ]);
    const count = Math.ceil(curve.getLength() / 0.125) + 1;
    return Array.from(
      { length: count },
      (_, i) => curve.getPointAt(i / (count - 1)).toArray() as Vector3Tuple,
    );
  }, [rise]);
  return (
    <group>
      <Loop position={[0, 1.7 + rise, -0.04]} radius={0.285} tube={0.038} />
      {Array.from({ length: 1 + Math.round(rise / 0.1) }, (_, i) => (
        <Loop
          key={`bridge${i}`}
          position={[0, 1.36 + i * 0.1, -0.015]}
          radius={0.064}
          tube={0.02}
          rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}
        />
      ))}
      <Loop
        position={[0, 1.24, 0]}
        radius={0.055}
        tube={0.02}
        rotation={[0, Math.PI / 2, 0]}
      />
      {chain.map((position, i) => (
        <Loop
          key={i}
          position={position}
          radius={0.071}
          tube={0.018}
          rotation={[0, i % 2 ? Math.PI / 2 : 0, -0.35]}
        />
      ))}
      <group position={[0.49, 1.2 + rise, 0.045]}>
        <mesh>
          <torusKnotGeometry args={[0.072, 0.023, 70, 8, 2, 3]} />
          <meshStandardMaterial color={CORD} roughness={0.9} />
        </mesh>
        {[-1, 1].map((s) => (
          <Thread
            key={s}
            color={CORD}
            radius={0.022}
            points={[
              [0, 0, 0],
              [s * 0.14, 0.05, 0],
              [s * 0.17, -0.03, 0],
              [s * 0.06, -0.08, 0.01],
              [s * 0.03, -0.18, 0],
            ]}
          />
        ))}
      </group>
      <group position={[0.89, 0.2, 0]}>
        <Loop position={[0, 0.27, 0]} radius={0.055} tube={0.018} />
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.07, 64]} />
          <meshStandardMaterial
            color={GOLD}
            metalness={0.88}
            roughness={0.25}
          />
        </mesh>
        <Loop radius={0.216} tube={0.009} position={[0, 0, 0.041]} />
        <Label text={animal.chinese} position={[0, 0, 0.047]} size={0.34} />
      </group>
      <group position={[0.7, 0.73 + rise * 0.3, 0.06]}>
        <Loop position={[0, 0.17, 0]} radius={0.04} tube={0.015} />
        <Bead size={[0.13, 0.14, 0.13]} metal />
        <Thread
          color="#785222"
          radius={0.009}
          points={[
            [-0.1, -0.035, 0.075],
            [0, -0.03, 0.13],
            [0.1, -0.035, 0.075],
          ]}
        />
        <Bead
          position={[0, -0.08, 0.105]}
          size={[0.026, 0.04, 0.015]}
          color="#66451c"
        />
      </group>
    </group>
  );
}
function EarsAndFeatures({ animal }: { animal: Zodiac }) {
  const {
    id,
    viewer: { color, accent },
  } = animal;
  return (
    <>
      {["rat", "ox", "tiger", "horse", "monkey"].includes(id) &&
        [-1, 1].map((s) => {
          const big = id === "rat" || id === "monkey",
            size = big ? 0.28 : 0.21;
          return (
            <group
              key={s}
              position={[s * (big ? 0.56 : 0.51), 1.02, -0.05]}
              rotation={[0, 0, -s * 0.23]}
            >
              <Plush size={[size, size, 0.12]} color={color} fibers={500} />
              <Plush
                size={[size * 0.65, size * 0.67, 0.045]}
                position={[0, 0.01, 0.11]}
                color={id === "monkey" ? "#e4b999" : "#edafba"}
                fibers={200}
                length={0.012}
              />
            </group>
          );
        })}
      {id === "rabbit" &&
        [-1, 1].map((s) => (
          <group
            key={s}
            position={[s * 0.31, 1.32, -0.02]}
            rotation={[0, 0, -s * 0.22]}
          >
            <Plush
              size={[0.22, 0.47, 0.145]}
              profile="ear"
              color={color}
              fibers={900}
            />
            <Plush
              size={[0.115, 0.32, 0.038]}
              position={[0, 0.035, 0.134]}
              profile="ear"
              color={accent}
              fibers={320}
              length={0.014}
            />
            <Seam
              points={[
                [0, -0.25, 0.16],
                [0.03, 0, 0.18],
                [0, 0.26, 0.16],
              ]}
              color="#dda8b2"
            />
          </group>
        ))}
      {id === "dog" &&
        [-1, 1].map((s) => (
          <Plush
            key={s}
            position={[s * 0.62, 0.66, 0.01]}
            size={[0.19, 0.45, 0.14]}
            profile="ear"
            rotation={[0.12, 0, s * 0.26]}
            color={accent}
            fibers={1100}
            length={0.032}
          />
        ))}
      {id === "pig" &&
        [-1, 1].map((s) => (
          <Plush
            key={s}
            position={[s * 0.49, 1.05, 0.01]}
            size={[0.25, 0.18, 0.12]}
            profile="leaf"
            rotation={[0, 0, -s * 0.9]}
            color={color}
            fibers={650}
          />
        ))}
      {id === "goat" &&
        [-1, 1].map((s) => (
          <group key={s}>
            <Plush
              position={[s * 0.58, 0.98, 0.01]}
              size={[0.28, 0.13, 0.1]}
              profile="ear"
              rotation={[0, 0, s * 0.18]}
              color={color}
              fibers={650}
            />
            <GoldCurve
              color={accent}
              radius={0.09}
              points={[
                [s * 0.38, 1.08, -0.1],
                [s * 0.61, 1.15, -0.13],
                [s * 0.66, 1.35, -0.1],
                [s * 0.5, 1.43, -0.05],
                [s * 0.43, 1.3, 0.0],
              ]}
            />
          </group>
        ))}
      {id === "ox" &&
        [-1, 1].map((s) => (
          <group key={s}>
            <GoldCurve
              color="#e7c786"
              radius={0.085}
              points={[
                [s * 0.4, 1.08, -0.02],
                [s * 0.45, 1.29, -0.04],
                [s * 0.39, 1.42, -0.05],
              ]}
            />
            <Bead
              position={[s * 0.39, 1.42, -0.05]}
              size={[0.08, 0.075, 0.07]}
              color="#eed397"
            />
          </group>
        ))}
      {id === "dragon" && (
        <>
          {[-1, 1].flatMap((s) =>
            [0, 1, 2].map((i) => (
              <Plush
                key={`${s}${i}`}
                position={[s * (0.67 - i * 0.035), 0.89 - i * 0.24, -0.08]}
                size={[0.17, 0.13, 0.1]}
                profile="leaf"
                rotation={[0, 0, -s * 0.9]}
                color="#f2cd85"
                fibers={220}
                length={0.013}
              />
            )),
          )}
          {[-1, 1].map((s) => (
            <group key={s}>
              <GoldCurve
                color="#efca80"
                radius={0.09}
                points={[
                  [s * 0.34, 1.08, -0.06],
                  [s * 0.36, 1.35, -0.06],
                  [s * 0.34, 1.48, -0.04],
                ]}
              />
              <GoldCurve
                color="#efca80"
                radius={0.065}
                points={[
                  [s * 0.36, 1.26, -0.06],
                  [s * 0.51, 1.33, -0.06],
                  [s * 0.55, 1.42, -0.05],
                ]}
              />
            </group>
          ))}
        </>
      )}
      {id === "rooster" && (
        <>
          {[-1, 0, 1].map((i) => (
            <Plush
              key={i}
              position={[i * 0.18, 1.17 + (i === 0 ? 0.09 : 0), -0.01]}
              size={[0.15, 0.2, 0.13]}
              color={accent}
              fibers={650}
              length={0.02}
            />
          ))}
          {[-1, 1].map((s) => (
            <Plush
              key={s}
              position={[s * 0.06, 0.32, 0.54]}
              size={[0.075, 0.13, 0.055]}
              color={accent}
              fibers={230}
              length={0.013}
            />
          ))}
          {[-1, 0, 1].map((i) => (
            <Plush
              key={`tail${i}`}
              position={[i * 0.19, -0.1, -0.39]}
              size={[0.16, 0.4, 0.14]}
              rotation={[0.4, 0, -i * 0.3]}
              color={accent}
              fibers={550}
            />
          ))}
        </>
      )}
      {id === "horse" && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <Plush
              key={i}
              position={[(i - 3.5) * 0.075, 1.14 + Math.sin(i) * 0.035, 0.08]}
              size={[0.13, 0.16, 0.13]}
              color={accent}
              fibers={500}
              length={0.04}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Plush
              key={`mane${i}`}
              position={[0, 0.8 - i * 0.22, -0.43]}
              size={[0.18, 0.2, 0.15]}
              color={accent}
              fibers={500}
              length={0.035}
            />
          ))}
        </>
      )}
      {id === "goat" &&
        Array.from({ length: 11 }, (_, i) => (
          <Plush
            key={i}
            position={[
              Math.cos(i * 2.4) * (0.22 + (i % 2) * 0.13),
              1.06 + Math.sin(i * 2.4) * 0.14,
              0.25 + (i % 3) * 0.04,
            ]}
            size={[0.2, 0.16, 0.14]}
            color={i % 2 ? "#f9efdf" : "#eddfd0"}
            fibers={430}
            length={0.035}
          />
        ))}
    </>
  );
}
function Face({ animal }: { animal: Zodiac }) {
  const {
      id,
      viewer: { color, accent },
    } = animal,
    cream = id === "monkey" ? "#edc6a7" : id === "rabbit" ? "#ffe8e3" : CREAM;
  return (
    <>
      {id !== "pig" && id !== "rooster" && (
        <Plush
          position={[0, 0.4, 0.445]}
          size={[id === "ox" || id === "horse" ? 0.47 : 0.4, 0.25, 0.145]}
          profile="muzzle"
          color={cream}
          fibers={950}
          length={0.012}
        />
      )}
      {id === "monkey" &&
        [-1, 1].map((s) => (
          <Plush
            key={s}
            position={[s * 0.25, 0.68, 0.4]}
            size={[0.28, 0.3, 0.09]}
            profile="muzzle"
            color={cream}
            fibers={350}
            length={0.013}
          />
        ))}
      {id === "dog" && (
        <Plush
          position={[0, 0.88, 0.445]}
          size={[0.1, 0.25, 0.035]}
          profile="leaf"
          color={CREAM}
          fibers={220}
          length={0.013}
        />
      )}
      {[-1, 1].map((s) => {
        const wink =
          (id === "rabbit" && s === 1) || (id === "monkey" && s === -1);
        return (
          <group key={s}>
            {wink ? (
              <Thread
                color="#512d23"
                radius={0.014}
                points={[
                  [s * 0.33, 0.62, 0.51],
                  [s * 0.27, 0.66, 0.525],
                  [s * 0.21, 0.62, 0.53],
                ]}
              />
            ) : (
              <>
                <Plush
                  position={[s * 0.26, 0.65, 0.46]}
                  size={[0.105, 0.12, 0.035]}
                  color={color}
                  fibers={100}
                  length={0.009}
                />
                <Bead
                  position={[s * 0.26, 0.65, 0.505]}
                  size={[0.071, 0.087, 0.045]}
                  color="#2b140e"
                />
                <Bead
                  position={[s * 0.25 - 0.014, 0.68, 0.54]}
                  size={[0.018, 0.022, 0.01]}
                  color="#fff9ed"
                />
              </>
            )}
            <Plush
              position={[s * 0.41, 0.46, 0.46]}
              size={[0.115, 0.065, 0.018]}
              color="#edacb3"
              fibers={190}
              length={0.006}
            />
          </group>
        );
      })}
      {id === "pig" ? (
        <>
          <Plush
            position={[0, 0.44, 0.53]}
            size={[0.22, 0.14, 0.085]}
            profile="muzzle"
            color={accent}
            fibers={300}
            length={0.009}
          />
          {[-1, 1].map((s) => (
            <Bead
              key={s}
              position={[s * 0.073, 0.45, 0.61]}
              size={[0.025, 0.041, 0.01]}
              color="#aa5b68"
            />
          ))}
        </>
      ) : id === "rooster" ? (
        <Plush
          position={[0, 0.46, 0.57]}
          size={[0.14, 0.095, 0.12]}
          profile="leaf"
          color="#efba3c"
          rotation={[Math.PI / 2, 0, 0]}
          fibers={150}
          length={0.008}
        />
      ) : (
        <>
          <Bead
            position={[0, 0.48, 0.597]}
            size={[0.061, 0.041, 0.023]}
            color={id === "dragon" ? "#79503a" : "#b16e70"}
          />
          {[-1, 1].map((s) => (
            <Thread
              key={s}
              color="#754a3c"
              radius={0.008}
              points={[
                [0, 0.46, 0.602],
                [s * 0.025, 0.415, 0.605],
                [s * 0.085, 0.407, 0.592],
                [s * 0.12, 0.44, 0.58],
              ]}
            />
          ))}
        </>
      )}
      {id === "ox" &&
        [-1, 1].map((s) => (
          <Bead
            key={s}
            position={[s * 0.075, 0.45, 0.595]}
            size={[0.018, 0.032, 0.007]}
            color="#78442e"
          />
        ))}
      {id === "tiger" && (
        <>
          {[0, 1, 2].map((i) => (
            <Thread
              key={i}
              color="#6c351b"
              radius={0.024}
              points={[
                [-0.14 + i * 0.02, 0.87 + i * 0.095, 0.445 - i * 0.045],
                [0, 0.88 + i * 0.095, 0.48 - i * 0.04],
                [0.14 - i * 0.02, 0.87 + i * 0.095, 0.445 - i * 0.045],
              ]}
            />
          ))}
          <Thread
            color="#6c351b"
            radius={0.019}
            points={[
              [0, 0.87, 0.48],
              [0, 1.09, 0.39],
            ]}
          />
          {[-1, 1].flatMap((s) =>
            [0, 1].map((i) => (
              <Thread
                key={`${s}${i}`}
                color="#6c351b"
                radius={0.021}
                points={[
                  [s * 0.56, 0.64 - i * 0.14, 0.3],
                  [s * 0.61, 0.6 - i * 0.14, 0.33],
                  [s * 0.54, 0.56 - i * 0.14, 0.38],
                ]}
              />
            )),
          )}
        </>
      )}
      {id === "dragon" &&
        [-1, 1].map((s) => (
          <Plush
            key={s}
            position={[s * 0.22, 0.91, 0.405]}
            size={[0.075, 0.04, 0.025]}
            color="#efc575"
            fibers={90}
            length={0.006}
          />
        ))}
    </>
  );
}
export default function PlushCharacter({ animal }: { animal: Zodiac }) {
  const {
    id,
    viewer: { color, accent },
  } = animal;
  return (
    <group position={[0, -0.43, 0]} scale={animal.viewer.scale}>
      {id === "snake" ? (
        <>
          <mesh position={[0, -0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.38, 0.19, 20, 64]} />
            <meshPhysicalMaterial color={color} roughness={0.95} sheen={1} />
          </mesh>
          <Plush
            position={[0, -0.53, 0.23]}
            size={[0.4, 0.22, 0.23]}
            profile="body"
            color={CREAM}
            fibers={500}
          />
          <Plush
            position={[0.43, -0.47, -0.02]}
            size={[0.23, 0.16, 0.24]}
            color={color}
            fibers={650}
          />
        </>
      ) : (
        <>
          <Plush
            position={[0, -0.26, 0]}
            size={[0.48, 0.5, 0.37]}
            profile="body"
            color={color}
            fibers={1900}
            length={id === "goat" ? 0.033 : 0.025}
          />
          <Plush
            position={[0, -0.34, 0.28]}
            size={[0.29, 0.33, 0.12]}
            profile="body"
            color={id === "pig" || id === "rabbit" ? "#f8d8d4" : CREAM}
            fibers={650}
            length={0.016}
          />
          {[-1, 1].map((s) => (
            <group key={s}>
              <Plush
                position={[s * 0.3, -0.68, 0.19]}
                size={[0.25, 0.23, 0.3]}
                profile="paw"
                color={color}
                fibers={850}
              />
              <Plush
                position={[s * 0.3, -0.69, 0.44]}
                size={[0.135, 0.12, 0.035]}
                profile="paw"
                color={id === "monkey" ? "#c29781" : "#f4d9c2"}
                fibers={180}
                length={0.01}
              />
              <Seam
                color={accent}
                points={[
                  [s * 0.29, -0.48, 0.43],
                  [s * 0.3, -0.6, 0.49],
                  [s * 0.3, -0.72, 0.48],
                ]}
              />
            </group>
          ))}
        </>
      )}
      {[-1, 1].map((s) => (
        <group key={`arm${s}`}>
          <Plush
            position={[s * 0.39, -0.07, 0.33]}
            size={[0.2, 0.29, 0.2]}
            profile="body"
            rotation={[0.3, 0, -s * 0.35]}
            color={color}
            fibers={900}
          />
          <Plush
            position={[s * 0.27, -0.13, 0.54]}
            size={[0.12, 0.15, 0.1]}
            profile="paw"
            color={["monkey", "ox", "dragon"].includes(id) ? CREAM : color}
            fibers={320}
          />
        </group>
      ))}
      {["rat", "monkey", "pig", "dog", "tiger", "horse", "dragon"].includes(
        id,
      ) && (
        <group position={[0.36, -0.4, -0.3]}>
          <GoldCurve
            color={id === "horse" ? accent : color}
            radius={id === "dragon" ? 0.13 : 0.075}
            points={[
              [0, 0, 0],
              [0.31, -0.05, -0.1],
              [0.43, 0.12, -0.12],
              [0.35, 0.27, -0.1],
              [0.22, 0.22, -0.1],
            ]}
          />
          {id === "horse" && (
            <Plush
              position={[0.35, 0.24, -0.1]}
              size={[0.16, 0.2, 0.16]}
              color={accent}
              fibers={650}
              length={0.035}
            />
          )}
        </group>
      )}
      <EarsAndFeatures animal={animal} />
      <Plush
        position={[0, 0.62, 0]}
        size={[0.66, 0.59, 0.49]}
        profile="head"
        color={color}
        fibers={3500}
        length={id === "goat" ? 0.032 : 0.022}
      />
      <Seam
        color={accent}
        points={[
          [0, 1.18, -0.08],
          [0, 1.05, -0.36],
          [0, 0.66, -0.51],
          [0, 0.24, -0.4],
        ]}
      />
      <Seam
        color={accent}
        points={[
          [0.33, 0.1, -0.2],
          [0.44, -0.25, -0.2],
          [0.33, -0.64, -0.22],
        ]}
      />
      <Face animal={animal} />
      <Accessory animal={animal} />
      <Hardware animal={animal} />
    </group>
  );
}
