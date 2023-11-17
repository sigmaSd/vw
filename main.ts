#!/usr/bin/env -S deno run --allow-read --allow-env --allow-write --allow-net main.ts
import { serveDir } from "https://deno.land/std@0.207.0/http/file_server.ts";
import { bundle } from "https://deno.land/x/emit@0.31.4/mod.ts";

function server() {
  Deno.serve({ port: 8000 }, (req) => {
    return serveDir(req, { fsRoot: "./pkg" });
  });
}

async function watchAndBundle() {
  const DEBOUNCE = 200 /*ms*/;
  let id;
  for await (const ev of Deno.watchFs(".")) {
    if (id) clearTimeout(id);
    id = setTimeout(async () => {
      if (ev.paths[0].endsWith(".ts")) {
        await bundleIndex();
      }
    }, DEBOUNCE);
  }

  async function bundleIndex() {
    const { code } = await bundle(
      new URL("file:///" + Deno.cwd() + "/pkg/index.ts"),
    );

    Deno.writeTextFileSync(
      "pkg/index.js",
      "// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n" + code,
    );
  }
}

if (import.meta.main) {
  server();
  watchAndBundle();
}
