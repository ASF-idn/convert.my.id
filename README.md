# convert.my.id

**100% Client-Side Processing • Privacy-First • Zero Server Load (100 Converter Tools)**

`convert.my.id` is a programmatic SEO-driven developer and creator utility website built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, statically exported (`output: 'export'`) for **Cloudflare Pages**.

## Generating All 100 Tools

Run the automated generator script to populate all 100 `.ts` converter modules in `lib/converters/`, the 100 SEO tool entries in `data/converters.json`, and the unified registry in `lib/converters/index.ts`:

```bash
node generate_tools.mjs
```

## Building for Production (`out/`)

```bash
npm run build
```
