import "server-only";
import { promises as fs } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import type { Storage } from "@/lib/storage";

function dataRoot(): string {
  const configured = process.env.STORAGE_LOCAL_PATH ?? "./data";
  return isAbsolute(configured) ? configured : resolve(process.cwd(), configured);
}

function pathFor(key: string): string {
  // Normalize: strip any leading slash, prevent path-traversal
  const safe = key.replace(/^\/+/, "").replace(/\.\./g, "");
  return join(dataRoot(), safe);
}

class LocalStorage implements Storage {
  async read(key: string): Promise<string | null> {
    try {
      return await fs.readFile(pathFor(key), "utf-8");
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw err;
    }
  }

  async write(key: string, data: string): Promise<void> {
    const path = pathFor(key);
    await fs.mkdir(dirname(path), { recursive: true });
    await fs.writeFile(path, data, "utf-8");
  }

  async list(prefix: string): Promise<string[]> {
    const root = pathFor(prefix);
    try {
      const entries = await fs.readdir(root, { withFileTypes: true });
      return entries
        .filter((e) => e.isFile())
        .map((e) => `${prefix.replace(/\/+$/, "")}/${e.name}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw err;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(pathFor(key));
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }
}

export function createLocalStorage(): Storage {
  return new LocalStorage();
}
