#!/bin/bash
export PATH="$HOME/.bun/bin:$PATH"
cd "$(dirname "$0")/.."
exec bun run dev
