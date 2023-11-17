#!/usr/bin/env -S deno run --allow-read=. --allow-run=deno --allow-net=0.0.0.0:8000 main.ts
import { serveDir } from "https://deno.land/std@0.207.0/http/file_server.ts";

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
        await bundle();
      }
    }, DEBOUNCE);
  }

  async function bundle() {
    await new Deno.Command("deno", {
      args: ["bundle", "--no-check", "pkg/index.ts", "pkg/index.js"],
    })
      .spawn().status;
  }
}

if (import.meta.main) {
  server();
  watchAndBundle();
}
