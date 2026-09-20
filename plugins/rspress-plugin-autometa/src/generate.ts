import fs from 'node:fs/promises';
import path from 'node:path';
import {
  isExcluded,
  isYearMonth,
  pageName,
  readFrontmatter,
  writeJsonIfChanged,
} from './utils';

export type SideMetaFile = {
  type: 'file';
  name: string;
  label?: string;
};

export type SideMetaDir = {
  type: 'dir';
  name: string;
  label?: string;
  collapsed?: boolean;
};

export type SideMetaItem = string | SideMetaFile | SideMetaDir;

export type PluginAutometaOptions = {
  /** Absolute or relative docs root. Defaults to Rspress `config.root`. */
  root?: string;
  /** Only generate `_meta.json` under these first-level directories. */
  include?: string[];
  /** Directory names or relative paths to skip. */
  exclude?: string[];
  /** Sidebar label for `index.md` / `index.mdx`. */
  indexLabel?: string;
  /** Whether directory groups are collapsed by default. */
  collapsed?: boolean;
};

type ResolvedAutometaOptions = {
  include?: string[];
  exclude: string[];
  indexLabel: string;
  collapsed: boolean;
};

const DEFAULT_EXCLUDE = ['public', 'node_modules'];

type DirEntry = {
  name: string;
  label: string;
};

type FileEntry = {
  name: string;
  sort: number;
};

export async function generateMetaFiles(
  docsRoot: string,
  options: PluginAutometaOptions = {},
): Promise<string[]> {
  const resolved: ResolvedAutometaOptions = {
    include: options.include,
    exclude: [...DEFAULT_EXCLUDE, ...(options.exclude ?? [])],
    indexLabel: options.indexLabel ?? 'Overview',
    collapsed: options.collapsed ?? false,
  };

  const written: string[] = [];
  const entries = await fs.readdir(docsRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const relativePath = entry.name;
    if (isExcluded(entry.name, relativePath, resolved.exclude)) {
      continue;
    }
    if (resolved.include && !resolved.include.includes(entry.name)) {
      continue;
    }

    await generateDirRecursive(
      path.join(docsRoot, entry.name),
      relativePath,
      resolved,
      written,
    );
  }

  return written;
}

async function generateDirRecursive(
  dir: string,
  relativePath: string,
  options: ResolvedAutometaOptions,
  written: string[],
): Promise<void> {
  const items = await buildMetaItems(dir, options);
  if (items.length > 0) {
    const metaPath = path.join(dir, '_meta.json');
    const changed = await writeJsonIfChanged(metaPath, items);
    if (changed) {
      written.push(metaPath);
    }
  }

  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const childRelativePath = `${relativePath}/${entry.name}`;
    if (isExcluded(entry.name, childRelativePath, options.exclude)) {
      continue;
    }

    await generateDirRecursive(
      path.join(dir, entry.name),
      childRelativePath,
      options,
      written,
    );
  }
}

export async function buildMetaItems(
  dir: string,
  options: Pick<
    ResolvedAutometaOptions,
    'exclude' | 'indexLabel' | 'collapsed'
  >,
): Promise<SideMetaItem[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let indexItem: SideMetaFile | undefined;
  const dirs: DirEntry[] = [];
  const files: FileEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '_meta.json') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);
    const relativeName = entry.name;

    if (entry.isDirectory()) {
      if (isExcluded(entry.name, relativeName, options.exclude)) {
        continue;
      }

      const indexFile = await findIndexFile(fullPath);
      const label =
        indexFile === undefined
          ? entry.name
          : String((await readFrontmatter(indexFile)).title ?? entry.name);
      dirs.push({ name: entry.name, label });
      continue;
    }

    const name = pageName(entry.name);
    if (!name) {
      continue;
    }

    if (name === 'index') {
      indexItem = {
        type: 'file',
        name: 'index',
        label: options.indexLabel,
      };
      continue;
    }

    const frontmatter = await readFrontmatter(fullPath);
    files.push({
      name,
      sort: typeof frontmatter.sort === 'number' ? frontmatter.sort : 0,
    });
  }

  dirs.sort((a, b) => compareDirNames(a.name, b.name));
  files.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, 'zh'));

  const items: SideMetaItem[] = [];
  if (indexItem) {
    items.push(indexItem);
  }
  for (const dirEntry of dirs) {
    items.push({
      type: 'dir',
      name: dirEntry.name,
      label: dirEntry.label,
      collapsed: options.collapsed,
    });
  }
  for (const file of files) {
    items.push(file.name);
  }

  return items;
}

async function findIndexFile(dir: string): Promise<string | undefined> {
  for (const ext of ['.mdx', '.md'] as const) {
    const filePath = path.join(dir, `index${ext}`);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        return filePath;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
  return undefined;
}

function compareDirNames(a: string, b: string): number {
  if (isYearMonth(a) && isYearMonth(b)) {
    return b.localeCompare(a);
  }
  return a.localeCompare(b, 'zh');
}
