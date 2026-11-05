"use client";
import { Component, useState, type ReactNode } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { Canvas, type CanvasProps } from "@react-three/fiber";
class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
export default function SceneCanvas({
  children,
  fallback,
  ...props
}: CanvasProps & { fallback: ReactNode }) {
  const [supported] = useState(() => {
    if (typeof document === "undefined") return false;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    const result = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return result;
  });
  if (!supported) return fallback;
  return (
    <Boundary fallback={fallback}>
      <Canvas
        dpr={[1, 1.75]}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMappingExposure = 1;
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        {...props}
      >
        {children}
      </Canvas>
    </Boundary>
  );
}
