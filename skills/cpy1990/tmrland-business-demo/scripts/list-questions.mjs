#!/usr/bin/env node
import { tmrFetch, parseArgs } from "./_lib.mjs";

const { help, named } = parseArgs(process.argv);
if (help) {
  console.error("Usage: list-questions.mjs [--category X] [--sort hot] [--limit N]");
  process.exit(2);
}

const limit = Number.parseInt(named.limit ?? "20", 10);
const sort = named.sort ?? "created_at";
let path = `/apparatus/?sort_by=${sort}&limit=${limit}`;
if (named.category) path += `&category=${named.category}`;

const data = await tmrFetch("GET", path);

console.log(`## Grand Apparatus Questions (${data.items?.length ?? 0})\n`);
for (const q of data.items ?? []) {
  console.log(`- ${q.id} | ${q.category ?? "—"} | ${q.question_text_en?.slice(0, 80) ?? q.question_text_zh?.slice(0, 80) ?? "—"}`);
}
