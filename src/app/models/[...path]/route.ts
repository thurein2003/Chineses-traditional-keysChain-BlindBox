import { readFile, realpath } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
export const dynamic = "force-dynamic";
const contentTypes: Record<string, string> = {
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
  ".bin": "application/octet-stream",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ktx2": "image/ktx2",
};
/** Public files are indexed at production startup; this route also serves models
 * and their resources that are added while the local server is already running. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const root = resolve(process.cwd(), "public/models");
  const { path } = await params;
  try {
    const file = await realpath(resolve(root, ...path));
    if (!file.startsWith(root + sep))
      return new Response("未找到模型资源", { status: 404 });
    const bytes = await readFile(file);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          contentTypes[extname(file).toLowerCase()] ??
          "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("未找到模型资源", { status: 404 });
  }
}
