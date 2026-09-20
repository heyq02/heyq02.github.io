import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { expect, test } from '@rstest/core';
import { generateNavFile } from '../src/index';

async function createDocsFixture(): Promise<string> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'autonav-'));

  await fs.mkdir(path.join(root, 'zhihu'), { recursive: true });
  await fs.mkdir(path.join(root, 'juejin'), { recursive: true });
  await fs.mkdir(path.join(root, 'public'), { recursive: true });
  await fs.mkdir(path.join(root, 'hidden'), { recursive: true });

  await fs.writeFile(
    path.join(root, 'zhihu', 'index.md'),
    `---
overview: true
title: 知乎回答
nav: 社会思考
icon: https://cdn.simpleicons.org/zhihu
sort: 1
---
`,
  );
  await fs.writeFile(
    path.join(root, 'juejin', 'index.md'),
    `---
overview: true
title: 稀土掘金文章
nav: 技术博文
icon: https://cdn.simpleicons.org/juejin
sort: 2
---
`,
  );
  await fs.writeFile(path.join(root, 'hidden', 'notes.md'), '# skip\n');
  await fs.writeFile(path.join(root, 'index.md'), '# home\n');

  return root;
}

test('generates _nav.json from first-level directories with index pages', async () => {
  const root = await createDocsFixture();

  await generateNavFile(root);

  const nav = JSON.parse(
    await fs.readFile(path.join(root, '_nav.json'), 'utf8'),
  ) as unknown;
  expect(nav).toEqual([
    {
      text: '社会思考',
      link: '/zhihu/',
      activeMatch: '/zhihu/',
      icon: 'https://cdn.simpleicons.org/zhihu',
    },
    {
      text: '技术博文',
      link: '/juejin/',
      activeMatch: '/juejin/',
      icon: 'https://cdn.simpleicons.org/juejin',
    },
  ]);
});

test('does not rewrite _nav.json when content is unchanged', async () => {
  const root = await createDocsFixture();
  const first = await generateNavFile(root);
  const second = await generateNavFile(root);

  expect(first).toBe(path.join(root, '_nav.json'));
  expect(second).toBeUndefined();
});
