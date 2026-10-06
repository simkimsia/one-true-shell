// Loads the entities and seed data the suite runs against (SPEC.md section 2), and checks the
// rules that data must meet so every test can pick its records from it.
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'yaml';

export type Field = { type: string; required?: boolean; title?: boolean; values?: string[]; to?: string };
export type SeedRecord = { id: string } & Record<string, string>;
export type Entity = {
  key: string;
  label: string;
  plural: string;
  fields: Record<string, Field>;
  titleField: string;
  seed: SeedRecord[];
};

const ID = /^[A-Za-z0-9_-]+$/;

export function loadShellData(dir = process.env.SHELL_SCHEMA_DIR) {
  if (!dir) throw new Error('SHELL_SCHEMA_DIR is not set; run the suite through playwright.config.ts.');
  const raw = parse(fs.readFileSync(path.join(dir, 'entities.yaml'), 'utf8'))?.entities ?? {};
  const seed = JSON.parse(fs.readFileSync(path.join(dir, 'seed.json'), 'utf8'));
  const problems: string[] = [];

  const entities: Entity[] = Object.entries<any>(raw).map(([key, e]) => {
    const fields: Record<string, Field> = e.fields ?? {};
    const titles = Object.keys(fields).filter((f) => fields[f].title);
    if (!ID.test(key)) problems.push(`entity key "${key}" must match ${ID}`);
    if (!e.label || !e.plural) problems.push(`entity "${key}" needs a label and a plural`);
    if (titles.length !== 1) problems.push(`entity "${key}" needs exactly one field with title: true`);
    else if (fields[titles[0]].type !== 'string') problems.push(`title field of "${key}" must be type string`);
    const rows: SeedRecord[] = seed[key] ?? [];
    for (const r of rows) if (!ID.test(String(r.id))) problems.push(`seed id "${r.id}" in "${key}" must match ${ID}`);
    return { key, label: e.label, plural: e.plural, fields, titleField: titles[0], seed: rows };
  });

  const [A, B] = entities;
  if (entities.length < 2) problems.push('at least two entities are required');
  if (A && A.seed.length < 3) problems.push(`first entity "${A.key}" needs at least 3 seed records`);
  if (B && B.seed.length < 2) problems.push(`second entity "${B.key}" needs at least 2 seed records`);
  for (const x of entities) for (const y of entities) {
    if (x !== y && x.plural && y.plural && x.plural.toLowerCase().includes(y.plural.toLowerCase())) {
      problems.push(`plural "${x.plural}" contains plural "${y.plural}"; palette filtering would be ambiguous`);
    }
  }
  if (problems.length) {
    throw new Error(`Shell data in ${dir} breaks SPEC.md section 2:\n- ${problems.join('\n- ')}`);
  }
  return { dir, entities, A, B };
}

export const title = (e: Entity, i: number) => e.seed[i][e.titleField];
export const id = (e: Entity, i: number) => e.seed[i].id;
