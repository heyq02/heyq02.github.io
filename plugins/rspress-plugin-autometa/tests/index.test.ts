import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@rstest/core';
import { generateMetaFiles } from '../src/index';

async function createDocsFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'autometa-'));

  await fs.mkdir(path.join(root, 'zhihu', '2026-09'), { recursive: true });
  await fs.mkdir(path.join(root, 'zhihu', '2026-10'), { recursive: true });
  await fs.mkdir(path.join(root, 'public'), { recursive: true });

  await fs.writeFile(
    path.join(root, 'zhihu', 'index.md'),
    `---
overview: true
title: 知乎回答
nav: 社会思考
---
`,
  );
  await fs.writeFile(
    path.join(root, 'zhihu', '2026-09', 'article1.md'),
    `---
sort: 1
---
`,
  );
  await fs.writeFile(
    path.join(root, 'zhihu', '2026-09', 'article2.md'),
    `---
sort: 2
---
`,
  );
  await fs.writeFile(
    path.join(root, 'zhihu', '2026-10', 'article1.md'),
    `---
sort: 1
---
`,
  );
  await fs.writeFile(path.join(root, 'public', 'readme.md'), '# ignored\n');

  return root;
}

test('generates overview _meta.json for nested month archives', async () => {
  const root = await createDocsFixture();

  await generateMetaFiles(root, {
    indexLabel: '总览',
    collapsed: false,
  });

  const zhihuMeta = JSON.parse(
    await fs.readFile(path.join(root, 'zhihu', '_meta.json'), 'utf8'),
  ) as unknown;
  expect(zhihuMeta).toEqual([
    { type: 'file', name: 'index', label: '总览' },
    { type: 'dir', name: '2026-10', label: '2026-10', collapsed: false },
    { type: 'dir', name: '2026-09', label: '2026-09', collapsed: false },
  ]);

  const monthMeta = JSON.parse(
    await fs.readFile(
      path.join(root, 'zhihu', '2026-09', '_meta.json'),
      'utf8',
    ),
  ) as unknown;
  expect(monthMeta).toEqual(['article1', 'article2']);

  await expect(fs.stat(path.join(root, '_meta.json'))).rejects.toMatchObject({
    code: 'ENOENT',
  });
  await expect(
    fs.stat(path.join(root, 'public', '_meta.json')),
  ).rejects.toMatchObject({ code: 'ENOENT' });
});

test('does not rewrite _meta.json when content is unchanged', async () => {
  const root = await createDocsFixture();
  const first = await generateMetaFiles(root, { indexLabel: '总览' });
  const second = await generateMetaFiles(root, { indexLabel: '总览' });

  expect(first.length).toBeGreaterThan(0);
  expect(second).toEqual([]);
});
