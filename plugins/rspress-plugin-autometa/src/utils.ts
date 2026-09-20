import fs from 'node:fs/promises';
import path from 'node:path';

export const PAGE_EXTENSIONS = ['.mdx', '.md'] as const;

export type FrontmatterValue = string | number | boolean;

export async function writeJsonIfChanged(
  filePath: string,
  value: unknown,
): Promise<boolean> {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  try {
    const current = await fs.readFile(filePath, 'utf8');
    if (current === next) {
      return false;
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, next, 'utf8');
  return true;
}

export function parseFrontmatter(
  content: string,
): Record<string, FrontmatterValue> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    return {};
  }

  const result: Record<string, FrontmatterValue> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const sep = trimmed.indexOf(':');
    if (sep <= 0) {
      continue;
    }

    result[trimmed.slice(0, sep).trim()] = parseScalar(
      trimmed.slice(sep + 1).trim(),
    );
  }
  return result;
}

export async function readFrontmatter(
  filePath: string,
): Promise<Record<string, FrontmatterValue>> {
  const content = await fs.readFile(filePath, 'utf8');
  return parseFrontmatter(content);
}

export function pageName(filename: string): string | undefined {
  const ext = PAGE_EXTENSIONS.find((item) => filename.endsWith(item));
  return ext ? filename.slice(0, -ext.length) : undefined;
}

export function isYearMonth(name: string): boolean {
  return /^\d{4}-\d{2}$/.test(name);
}

export function isExcluded(
  name: string,
  relativePath: string,
  patterns: string[],
): boolean {
  return patterns.some(
    (pattern) => pattern === name || pattern === relativePath,
  );
}

function parseScalar(raw: string): FrontmatterValue {
  if (raw === 'true') {
    return true;
  }
  if (raw === 'false') {
    return false;
  }
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    return raw.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    return Number(raw);
  }
  return raw;
}
