const GQL_SCALAR_MAP: Record<string, string> = {
  ID: 'string',
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
};

export function convertGraphqlToTypescript(input: string): string {
  if (!input.trim()) return '';
  const typeBlocks = input.match(/type\s+([A-Za-z0-9_]+)\s*\{([^}]*)\}/g);
  if (!typeBlocks) return '// No GraphQL type blocks found';

  return typeBlocks
    .map((block) => {
      const header = block.match(/type\s+([A-Za-z0-9_]+)/);
      const name = header ? header[1] : 'GraphQLType';
      const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
      const fields = body
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((line) => {
          const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.+)$/);
          if (!m) return '';
          const fieldName = m[1];
          const rawType = m[2].trim();
          const isRequired = rawType.endsWith('!');
          const isList = rawType.startsWith('[');
          const core = rawType.replace(/[\[\]!]/g, '');
          const mapped = GQL_SCALAR_MAP[core] ?? core;
          return `  ${fieldName}${isRequired ? '' : '?'}: ${mapped}${isList ? '[]' : ''};`;
        })
        .filter(Boolean);
      return `export interface ${name} {\n${fields.join('\n')}\n}`;
    })
    .join('\n\n');
}
