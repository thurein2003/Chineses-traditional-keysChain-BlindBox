"use client";
import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Sparkles } from "@react-three/drei";
import { Group, MathUtils, SRGBColorSpace } from "three";
import { BOX_IMAGE } from "@/data/zodiac";
import type { Phase } from "@/lib/unboxing";
import SceneCanvas from "./SceneCanvas";
const W = 1.92,
  H = (W * 504) / 372,
  D = 1.35;
function Box({
  index,
  selected,
  phase,
  reduced,
  onSelect,
  onOpen,
}: {
  index: number;
  selected: number;
  phase: Phase;
  reduced: boolean;
  onSelect: (n: number) => void;
  onOpen: () => void;
}) {
  const group = useRef<Group>(null),
    lid = useRef<Group>(null);
  const texture = useTexture(BOX_IMAGE, (texture) => {
    texture.colorSpace = SRGBColorSpace;
  });
  const frontUV = useMemo(() => {
    // The updated square source is a full product photo. Project its actual
    // front quadrilateral; keep the full original file untouched.
    const size = texture.image as { width: number; height: number };
    return size.width === 512 && size.height === 512
      ? new Float32Array([
          68 / 512,
          1 - 82 / 512,
          296 / 512,
          1 - 105 / 512,
          68 / 512,
          1 - 475 / 512,
          296 / 512,
          1 - 490 / 512,
        ])
      : new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
  }, [texture]);
  const delta = ((index - selected + 18) % 12) - 6;
  const center = delta === 0,
    active = phase !== "IDLE";
  const opening = ["OPENING", "REVEALING", "CELEBRATING", "RESULT"].includes(
    phase,
  );
  useFrame(({ clock }, dt) => {
    if (!group.current || !lid.current) return;
    const t = clock.elapsedTime;
    const x = delta * 3.05,
      y = center ? 0 : -0.35;
    const targetScale = center ? 1 : 0.75;
    group.current.visible = Math.abs(delta) <= 1 && (!active || center);
    group.current.position.x = MathUtils.damp(
      group.current.position.x,
      x,
      8,
      dt,
    );
    group.current.position.y = MathUtils.damp(
      group.current.position.y,
      y + (reduced ? 0 : Math.sin(t * 1.35 + index) * 0.055),
      8,
      dt,
    );
    group.current.position.z = MathUtils.damp(
      group.current.position.z,
      center ? 0.5 : -1.1 - Math.abs(delta) * 0.45,
      8,
      dt,
    );
    const shake =
      phase === "ANTICIPATING" && center && !reduced
        ? Math.sin(t * 44) * 0.032
        : 0;
    group.current.rotation.set(
      0.045,
      MathUtils.damp(
        group.current.rotation.y,
        center ? -0.16 : delta > 0 ? -0.38 : 0.34,
        8,
        dt,
      ),
      shake,
    );
    group.current.scale.setScalar(
      MathUtils.damp(group.current.scale.x, targetScale, 8, dt),
    );
    lid.current.rotation.x = MathUtils.damp(
      lid.current.rotation.x,
      opening && center ? -1.85 : 0,
      5,
      dt,
    );
    lid.current.position.y = MathUtils.damp(
      lid.current.position.y,
      H / 2 + (opening && center ? 0.32 : 0),
      5,
      dt,
    );
  });
  return (
    <group
      ref={group}
      position={[delta * 3.05, 0, center ? 0.5 : -1.5]}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) {
          if (center) onOpen();
          else onSelect(index);
        }
      }}
      onPointerOver={() => {
        document.body.style.cursor = active ? "default" : "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Four separate walls and a base leave a genuinely hollow interior. */}
      {[-1, 1].map((s) => (
        <mesh key={`side${s}`} position={[(s * W) / 2, 0, 0]}>
          <boxGeometry args={[0.075, H, D]} />
          <meshStandardMaterial color="#a82328" roughness={0.36} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={`panel${s}`} position={[0, 0, (s * D) / 2]}>
          <boxGeometry args={[W, H, 0.075]} />
          <meshStandardMaterial
            color={s === 1 ? "#ba272c" : "#8d1924"}
            roughness={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, -H / 2, 0]}>
        <boxGeometry args={[W, 0.08, D]} />
        <meshStandardMaterial color="#6d101c" />
      </mesh>
      <mesh position={[0, 0, D / 2 + 0.04]}>
        <planeGeometry args={[W, H]}>
          <bufferAttribute attach="attributes-uv" args={[frontUV, 2]} />
        </planeGeometry>
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={`trim${s}`}>
          {[-0.46, 0.46].map((y) => (
            <mesh key={y} position={[s * (W / 2 + 0.04), y * H, 0]}>
              <boxGeometry args={[0.012, 0.025, D]} />
              <meshStandardMaterial
                color="#f7ce79"
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
          ))}
          <mesh
            position={[s * (W / 2 + 0.045), 0, 0]}
            rotation={[0, Math.PI / 2, Math.PI / 4]}
          >
            <planeGeometry args={[0.46, 0.46]} />
            <meshStandardMaterial
              color="#f0be61"
              metalness={0.6}
              roughness={0.4}
              side={2}
            />
          </mesh>
        </group>
      ))}
      <group ref={lid} position={[0, H / 2, -D / 2]}>
        <mesh position={[0, 0.015, D / 2]}>
          <boxGeometry args={[W + 0.09, 0.105, D + 0.09]} />
          <meshStandardMaterial color="#b9242c" roughness={0.28} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (W / 2 - 0.03), 0.073, D / 2]}>
            <boxGeometry args={[0.023, 0.008, D - 0.04]} />
            <meshStandardMaterial
              color="#efc570"
              metalness={0.6}
              roughness={0.2}
            />
          </mesh>
        ))}
        <mesh position={[0, 0.074, D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.29, 0.315, 48]} />
          <meshStandardMaterial color="#f1cc80" metalness={0.6} />
        </mesh>
      </group>
      {center && opening && (
        <>
          <pointLight position={[0, 1.25, 0]} color="#ffcf69" intensity={12} />
          <Sparkles
            count={reduced ? 0 : 38}
            scale={[2, 3, 2]}
            size={5}
            speed={0.8}
            color="#ffe3a2"
            position={[0, 1.8, 0]}
          />
        </>
      )}
    </group>
  );
}
export default function BoxCarousel(props: {
  selected: number;
  phase: Phase;
  reduced: boolean;
  onSelect: (n: number) => void;
  onOpen: () => void;
}) {
  return (
    <SceneCanvas
      camera={{ position: [0, 0.4, 7.2], fov: 34 }}
      frameloop="always"
      fallback={
        <div className="box-fallback">
          <button onClick={props.onOpen} disabled={props.phase !== "IDLE"}>
            <img src={BOX_IMAGE} alt="生肖盲盒原版包装照片" />
          </button>
          <span>实物照片模式 · 当前设备无法显示立体图形</span>
        </div>
      }
    >
      <ambientLight intensity={1.6} />
      <directionalLight position={[4, 6, 6]} intensity={3} />
      <directionalLight position={[-4, 2, -3]} intensity={2} color="#ffcb79" />
      <Suspense fallback={null}>
        {Array.from({ length: 12 }, (_, i) => (
          <Box key={i} index={i} {...props} />
        ))}
      </Suspense>
    </SceneCanvas>
  );
}
