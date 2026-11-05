"use client";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  OrbitControls,
  ContactShadows,
  useGLTF,
  Environment,
  Lightformer,
  PerformanceMonitor,
} from "@react-three/drei";
import { Box3, Vector3, Group, BackSide } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { OrbitControls as OrbitControlsType } from "three-stdlib";
import type { Zodiac } from "@/data/zodiac";
import Character from "./Characters";
import SceneCanvas from "./SceneCanvas";
import { PlushQuality } from "./PlushMaterials";
function Model({ path, onReady }: { path: string; onReady: () => void }) {
  const { scene } = useGLTF(path);
  const object = useMemo(() => {
    const model = clone(scene),
      box = new Box3().setFromObject(model),
      size = box.getSize(new Vector3()),
      center = box.getCenter(new Vector3());
    const extent = Math.max(size.x, size.y, size.z);
    if (!Number.isFinite(extent) || extent <= 0)
      throw new Error("模型缺少可显示的几何数据");
    model.position.sub(center);
    const root = new Group();
    root.add(model);
    root.scale.setScalar(2.65 / extent);
    return root;
  }, [scene]);
  useEffect(() => {
    onReady();
  }, [onReady]);
  return <primitive object={object} />;
}
class ModelBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function ToyScene({
  animal,
  autoRotate,
  reset,
  reduced,
  onModelKind,
}: {
  animal: Zodiac;
  autoRotate: boolean;
  reset: number;
  reduced: boolean;
  onModelKind: (s: string) => void;
}) {
  const controls = useRef<OrbitControlsType>(null);
  const [path, setPath] = useState<string | null>(null),
    [modelReady, setModelReady] = useState(false),
    [dpr, setDpr] = useState(1.5),
    [density] = useState(() =>
      window.matchMedia("(max-width: 767px)").matches ? 0.55 : 1,
    );
  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => r.json())
      .then((models) => {
        if (!cancelled && models[animal.id]) {
          setPath(models[animal.id]);
          onModelKind("正在加载外部精细模型…");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [animal.id, onModelKind]);
  useEffect(() => {
    controls.current?.reset();
  }, [reset]);
  const ready = useMemo(
    () => () => {
      setModelReady(true);
      onModelKind("外部精细模型 · 原始材质");
    },
    [onModelKind],
  );
  const fallback = (
    <div className="viewer-fallback">
      <img src={animal.image} alt={`${animal.meaning.chineseName}实物照片`} />
      <p>当前设备无法显示立体模型，仍可欣赏原始实物照片。</p>
    </div>
  );
  return (
    <SceneCanvas
      camera={{ position: [0, 0.28, 5.8], fov: 35 }}
      dpr={dpr}
      fallback={fallback}
      onDoubleClick={() => controls.current?.reset()}
    >
      <color attach="background" args={["#f3eee5"]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 5]} intensity={2.2} color="#fff3df" />
      <directionalLight
        position={[-4, 2, 3]}
        intensity={0.85}
        color="#eef3ff"
      />
      <directionalLight position={[2, 4, -4]} intensity={2.8} color="#ffe2ad" />
      <Environment resolution={128} frames={1} environmentIntensity={0.65}>
        <mesh scale={20}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#cabfac" side={BackSide} />
        </mesh>
        <Lightformer
          position={[-3, 3, 4]}
          rotation={[0, Math.PI / 5, 0]}
          scale={[3, 5, 1]}
          intensity={3.5}
          color="#fff5e8"
        />
        <Lightformer
          position={[4, 1, 3]}
          rotation={[0, -Math.PI / 4, 0]}
          scale={[2, 4, 1]}
          intensity={2}
          color="#fffaff"
        />
        <Lightformer
          position={[0, 5, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[4, 2, 1]}
          intensity={3}
          color="#ffe7b9"
        />
      </Environment>
      <PlushQuality.Provider value={density}>
        <Suspense fallback={<Character animal={animal} />}>
          {path ? (
            <ModelBoundary
              key={path}
              fallback={<Character animal={animal} />}
              onError={() => onModelKind("模型加载失败 · 显示程序化毛绒模型")}
            >
              <Model path={path} onReady={ready} />
            </ModelBoundary>
          ) : (
            <Character animal={animal} />
          )}
        </Suspense>
      </PlushQuality.Provider>
      <ContactShadows
        key={modelReady && path ? path : animal.id}
        position={[0, -1.34, 0]}
        opacity={0.35}
        scale={6}
        blur={2.8}
        far={3}
        frames={reduced ? 1 : 40}
        resolution={512}
        color="#735a45"
      />
      <OrbitControls
        ref={controls}
        makeDefault
        target={[0, animal.id === "rabbit" ? 0.25 : 0.08, 0]}
        minDistance={3.3}
        maxDistance={9}
        autoRotate={autoRotate && !reduced}
        autoRotateSpeed={0.8}
        enableDamping
        dampingFactor={0.07}
        enablePan={false}
        minPolarAngle={0.15}
        maxPolarAngle={Math.PI * 0.85}
      />
      <PerformanceMonitor
        onDecline={() => setDpr(1)}
        onIncline={() => setDpr(1.75)}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
    </SceneCanvas>
  );
}
