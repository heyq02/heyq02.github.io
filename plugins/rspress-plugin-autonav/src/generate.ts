import fs from 'node:fs/promises';
import path from 'node:path';
import {
  findIndexFile,
  isExcluded,
  readFrontmatter,
  writeJsonIfChanged,
} from './utils';

export type NavItem = {
  text: string;
  link: string;
  activeMatch: string;
  icon?: string;
};

export type PluginAutonavOptions = {
  /** Absolute or relative docs root. Defaults to Rspress `config.root`. */
  root?: string;
  /** Only include these first-level directories. */
  include?: string[];
  /** Directory names or relative paths to skip. */
  exclude?: string[];
};

type NavCandidate = NavItem & {
  sort: number;
};

const DEFAULT_EXCLUDE = ['public', 'node_modules'];

export async function generateNavFile(
  docsRoot: string,
  options: PluginAutonavOptions = {},
): Promise<string | undefined> {
  const nav = await buildNavItems(docsRoot, options);
  const navPath = path.join(docsRoot, '_nav.json');
  const changed = await writeJsonIfChanged(navPath, nav);
  return changed ? navPath : undefined;
}

export async function buildNavItems(
  docsRoot: string,
  options: PluginAutonavOptions = {},
): Promise<NavItem[]> {
  const exclude = [...DEFAULT_EXCLUDE, ...(options.exclude ?? [])];
  const entries = await fs.readdir(docsRoot, { withFileTypes: true });
  const items: NavCandidate[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (isExcluded(entry.name, entry.name, exclude)) {
      continue;
    }
    if (options.include && !options.include.includes(entry.name)) {
      continue;
    }

    const dir = path.join(docsRoot, entry.name);
    const indexFile = await findIndexFile(dir);
    if (!indexFile) {
      continue;
    }

    const frontmatter = await readFrontmatter(indexFile);
    if (frontmatter.nav === false) {
      continue;
    }

    const text = String(frontmatter.nav ?? frontmatter.title ?? entry.name);
    const icon =
      typeof frontmatter.icon === 'string' ? frontmatter.icon : undefined;
    const item: NavCandidate = {
      text,
      link: `/${entry.name}/`,
      activeMatch: `/${entry.name}/`,
      sort: typeof frontmatter.sort === 'number' ? frontmatter.sort : 0,
    };
    if (icon) {
      item.icon = icon;
    }
    items.push(item);
  }

  items.sort((a, b) => a.sort - b.sort || a.text.localeCompare(b.text, 'zh'));

  return items.map((item) => {
    const navItem: NavItem = {
      text: item.text,
      link: item.link,
      activeMatch: item.activeMatch,
    };
    if (item.icon) {
      navItem.icon = item.icon;
    }
    return navItem;
  });
}
