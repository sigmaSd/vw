#!/usr/bin/env -S deno run --allow-read --allow-env --allow-write --allow-net main.ts
import { serveDir } from "https://deno.land/std@0.207.0/http/file_server.ts";
import { bundle } from "https://deno.land/x/emit@0.31.4/mod.ts";

function startServer({ port }: { port: number }) {
  Deno.serve({ port }, (req) => {
    return serveDir(req, { fsRoot: "./pkg" });
  });
}

class Watcher {
  #clients: {
    regex: RegExp;
    callback: () => void | Promise<void>;
  }[] = [];
  constructor() {}
  static start() {
    const self = new Watcher();
    (async () => {
      const DEBOUNCE = 200 /*ms*/;
      let id;
      for await (const ev of Deno.watchFs(".")) {
        if (id) clearTimeout(id);
        id = setTimeout(async () => {
          const path = ev.paths[0];
          await self.#notify(path);
        }, DEBOUNCE);
      }
    })();
    return self;
  }
  async #notify(path: string) {
    for (const client of this.#clients) {
      if (path.match(client.regex)) {
        await client.callback();
      }
    }
  }
  register(regex: RegExp, callback: () => void) {
    this.#clients.push({ regex, callback });
  }
}

async function bundler() {
  const { code } = await bundle(
    new URL("file:///" + Deno.cwd() + "/pkg/index.ts"),
  );

  Deno.writeTextFileSync(
    "pkg/index.js",
    "// THIS FILE IS AUTO-GENERATED, DO NOT EDIT\n" + code,
  );
}

class Reloader {
  #sockets: Map<number, WebSocket> = new Map();
  #id = 0;
  constructor({ port }: { port: number }) {
    Deno.serve({ port }, (req) => {
      if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 501 });
      }

      const { socket, response } = Deno.upgradeWebSocket(req);

      socket.onopen = () => {
        this.#sockets.set(this.#id, socket);
      };
      socket.onclose = () => {
        this.#sockets.delete(this.#id);
      };

      this.#id++;
      return response;
    });
  }
  reload() {
    this.#sockets.forEach((socket) => socket.send("reload"));
  }
}

if (import.meta.main) {
  startServer({ port: 8000 });
  const reloader = new Reloader({ port: 8001 });
  const watcher = Watcher.start();
  watcher.register(/\.js$|\.html$|\.css$/, () => reloader.reload());
  watcher.register(/\.ts$/, bundler);
}
