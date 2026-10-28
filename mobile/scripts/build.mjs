import { cp, rm, mkdir } from "node:fs/promises";
await rm(new URL("../www", import.meta.url), { recursive: true, force: true });
await mkdir(new URL("../www", import.meta.url), { recursive: true });
await cp(
  new URL("../../web_user", import.meta.url),
  new URL("../www", import.meta.url),
  { recursive: true },
);
