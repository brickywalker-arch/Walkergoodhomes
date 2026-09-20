/**
 * Turns a batch into the node and edge payloads the canvas API takes.
 *
 *   node scripts/dev/photoreal-batch.mjs hall > batch.json
 *   node scripts/dev/photoreal-nodes.mjs batch.json nodes   # add_nodes, 20 at a time
 *   node scripts/dev/photoreal-nodes.mjs batch.json edges ids.json
 *
 * Nodes come out in dependency order so a parent is always created before its
 * children, and the display name is the slug — which is what maps a generated
 * artifact back to the selection it answers to.
 */
import fs from 'node:fs';

const [file, what, idsFile] = process.argv.slice(2);
const batch = JSON.parse(fs.readFileSync(file, 'utf8'));

const PARAMS = { aspect_ratio: '3:2', mode: 'edit', num_images: 1, free: false, resolution: '2K' };

if (what === 'loaders') {
  console.log(JSON.stringify(
    batch.uploads.map((u, i) => ({
      class_type: 'LoadImage',
      display_name: `REF ${u.for}`,
      position: { x: 0, y: i * 200 },
    })),
  ));
} else if (what === 'nodes') {
  const chunks = [];
  for (let i = 0; i < batch.generate.length; i += 20) chunks.push(batch.generate.slice(i, i + 20));
  chunks.forEach((chunk, ci) => {
    const payload = chunk.map((g, i) => ({
      class_type: 'NanoBananaProGenerate',
      display_name: g.slug,
      position: { x: 300 + g.depth * 300, y: (ci * 20 + i) * 140 },
      params: { ...PARAMS, prompt: g.prompt },
    }));
    fs.writeFileSync(`${file}.nodes${ci}.json`, JSON.stringify(payload));
    console.error(`${file}.nodes${ci}.json  ${payload.length} nodes`);
  });
} else if (what === 'edges') {
  const ids = JSON.parse(fs.readFileSync(idsFile, 'utf8'));
  const edges = batch.generate.map((g) => {
    const source = g.fromSlug ? ids.nodes[g.fromSlug] : ids.loaders[g.fromUpload];
    const target = ids.nodes[g.slug];
    if (!source || !target) throw new Error(`unmapped edge for ${g.slug}`);
    return { source, target };
  });
  for (let i = 0; i < edges.length; i += 50) {
    fs.writeFileSync(`${file}.edges${i / 50}.json`, JSON.stringify(edges.slice(i, i + 50)));
    console.error(`${file}.edges${i / 50}.json`);
  }
} else {
  console.error('what: loaders | nodes | edges');
  process.exit(1);
}
