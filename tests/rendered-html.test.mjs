import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Antenna Garden instrument", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Antenna Garden — tune what the weather kept<\/title>/i);
  assert.match(html, /<h1[^>]*>ANTENNA GARDEN<\/h1>/i);
  assert.match(html, /Wake/);
  assert.match(html, /THE RECEIVER/);
  assert.match(html, /Tuning dial/);
  assert.match(html, /Specimen ledger/);
  assert.match(html, /All transmissions are fictional/);
  assert.match(html, /data-direction-seed="afcdc577"/);
  assert.match(html, /THESIS: Listening behavior is the drawing tool/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("finished source has no disposable starter and includes the local texture", async () => {
  const [packageJson, page, layout, texture, socialPreview] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/textures/weather-paper.png", import.meta.url)),
    readFile(new URL("../public/og.png", import.meta.url)),
  ]);

  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.doesNotMatch(packageJson, /drizzle|db:generate/);
  assert.doesNotMatch(page, /_sites-preview|SkeletonPreview|codex-preview/);
  assert.doesNotMatch(layout, /next\/font\/google|Starter Project|codex-preview/);
  assert.equal(texture.readUInt32BE(0), 0x89504e47);
  assert.equal(texture.readUInt32BE(16), 1536);
  assert.equal(texture.readUInt32BE(20), 1024);
  assert.ok(texture.length > 1_000_000);
  assert.equal(socialPreview.readUInt32BE(0), 0x89504e47);
  assert.equal(socialPreview.readUInt32BE(16), 1200);
  assert.equal(socialPreview.readUInt32BE(20), 630);
  assert.ok(socialPreview.includes(Buffer.from("impeccable:prompt", "latin1")));
  assert.ok(socialPreview.length > 1_000_000);
  await assert.rejects(access(new URL("../app/_sites-preview/", import.meta.url)));
  await assert.rejects(access(new URL("../examples/d1/", import.meta.url)));
  await assert.rejects(access(new URL("../db/", import.meta.url)));
  assert.ok((await stat(new URL("../PRODUCT.md", import.meta.url))).size > 500);
});
