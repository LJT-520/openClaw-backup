#!/usr/bin/env node
import { tmrFetch, parseArgs } from "./_lib.mjs";

const { help, named } = parseArgs(process.argv);
if (help) {
  console.error("Usage: list-negotiations.mjs [--intention <id>]");
  process.exit(2);
}

let path = "/negotiations/?role=business";
if (named.intention) path += `&intention_id=${named.intention}`;

const data = await tmrFetch("GET", path);
console.log(`## Negotiations (${data.items?.length ?? 0})\n`);
for (const s of data.items ?? []) {
  console.log(`- ${s.id} | status: ${s.status} | intention: ${s.intention_id}`);
}
