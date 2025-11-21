# Repository instructions

This is a Next.js project for an LLM-assisted reader app.

## Package Manager
- Always use **Bun** for all package management and script execution
- Use `bun install` instead of npm/yarn/pnpm install
- Use `bun run` for running scripts
- Use `bun add` for adding dependencies

## UI Components
- Shadcn/ui is installed in this project
- Always use the Shadcn CLI to add new components: `bunx --bun shadcn@latest add <component-name>`
- Never manually create or copy component files from the Shadcn documentation
- Components will be automatically added to the `components/ui/` directory
