# configfetch >> [ff.gs0.me](https://ff.gs0.me)

A browser-based editor with the goal of making [fastfetch](https://github.com/fastfetch-cli/fastfetch) configuration files easier.

> This project is currently in alpha. The generated configs should work tho

## Features
- Most if not all options found in the fastfetch json schema can be toggled or edited
- Mostly-accurate live preview (*italic text: the control doesn't affect the preview*)
- Download or copy the created config

## Planned
#### Big
- Share configs with a share code or by url
- Possibly a simple user-submitted config browser
- Import a config to edit
#### Small
- Add color support to the preview
- Add, remove and change the order of the modules

## Development
The project uses Bun, SvelteKit with Svelte 5, Tailwind v4 and Vite.

`bun i`, `bun run dev`, blah blah blah

Open a pr for literally anything related