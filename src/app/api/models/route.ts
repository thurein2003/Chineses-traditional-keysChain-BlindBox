import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { ZODIAC } from "@/data/zodiac";
export const dynamic = "force-dynamic";
export async function GET() {
  const files = await readdir(join(process.cwd(), "public/models")).catch(
    () => [] as string[],
  );
  const models = Object.fromEntries(
    ZODIAC.map((a) => [
      a.id,
      a.viewer.modelPaths.find((path) =>
        files.includes(path.split("/").at(-1)!),
      ) ?? null,
    ]),
  );
  return Response.json(models, { headers: { "Cache-Control": "no-store" } });
}
