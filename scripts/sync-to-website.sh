#!/bin/bash
#
# Sync protocol spec files to aai-website for VitePress rendering.
#
# Usage:
#   cd aai-protocol
#   bash scripts/sync-to-website.sh
#
# What it does:
#   1. Copies spec/ (English)       -> aai-website/docs/spec/
#   2. Copies spec/zh-CN/ (Chinese) -> aai-website/docs/zh-CN/spec/
#   3. Copies schema/ and examples/ -> aai-website/docs/public/
#   4. Adds VitePress frontmatter to each .md file
#
# The synced files are gitignored in aai-website.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROTOCOL_DIR="$(dirname "$SCRIPT_DIR")"
WEBSITE_DIR="$(dirname "$PROTOCOL_DIR")/aai-website"

add_frontmatter() {
  local src_file="$1"
  local dest_file="$2"
  local title="$3"
  
  cat > "$dest_file" <<EOF
---
title: "$title"
---

EOF
  cat "$src_file" >> "$dest_file"
}

extract_title() {
  local file="$1"
  local title=""
  
  title=$(grep '^# ' "$file" | head -1 | sed 's/^# //')
  
  if [ -z "$title" ]; then
    title=$(basename "$file" .md | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/')
  fi
  
  echo "$title"
}

# Verify directories exist
if [ ! -d "$PROTOCOL_DIR/spec" ]; then
  echo "Error: $PROTOCOL_DIR/spec not found"
  exit 1
fi

if [ ! -d "$WEBSITE_DIR/docs" ]; then
  echo "Error: $WEBSITE_DIR/docs not found. Is aai-website set up?"
  exit 1
fi

echo "Syncing from: $PROTOCOL_DIR"
echo "Syncing to:   $WEBSITE_DIR"
echo ""

# ── 1. Sync English spec ──────────────────────────────────────────────
echo "→ Syncing English spec..."
rm -rf "$WEBSITE_DIR/docs/spec"
mkdir -p "$WEBSITE_DIR/docs/spec/platforms"

for f in "$PROTOCOL_DIR"/spec/*.md; do
  if [ -f "$f" ]; then
    filename=$(basename "$f")
    title=$(extract_title "$f")
    add_frontmatter "$f" "$WEBSITE_DIR/docs/spec/$filename" "$title"
  fi
done

if [ -d "$PROTOCOL_DIR/spec/platforms" ]; then
  for f in "$PROTOCOL_DIR"/spec/platforms/*.md; do
    if [ -f "$f" ]; then
      filename=$(basename "$f")
      title=$(extract_title "$f")
      add_frontmatter "$f" "$WEBSITE_DIR/docs/spec/platforms/$filename" "$title"
    fi
  done
fi

echo "  Processed $(find "$WEBSITE_DIR/docs/spec" -name '*.md' | wc -l | tr -d ' ') files"

# ── 2. Sync Chinese spec ──────────────────────────────────────────────
if [ -d "$PROTOCOL_DIR/spec/zh-CN" ]; then
  echo "→ Syncing Chinese spec..."
  rm -rf "$WEBSITE_DIR/docs/zh-CN/spec"
  mkdir -p "$WEBSITE_DIR/docs/zh-CN/spec/platforms"

  for f in "$PROTOCOL_DIR"/spec/zh-CN/*.md; do
    if [ -f "$f" ]; then
      filename=$(basename "$f")
      title=$(extract_title "$f")
      add_frontmatter "$f" "$WEBSITE_DIR/docs/zh-CN/spec/$filename" "$title"
    fi
  done

  if [ -d "$PROTOCOL_DIR/spec/zh-CN/platforms" ]; then
    for f in "$PROTOCOL_DIR"/spec/zh-CN/platforms/*.md; do
      if [ -f "$f" ]; then
        filename=$(basename "$f")
        title=$(extract_title "$f")
        add_frontmatter "$f" "$WEBSITE_DIR/docs/zh-CN/spec/platforms/$filename" "$title"
      fi
    done
  fi

  echo "  Processed $(find "$WEBSITE_DIR/docs/zh-CN/spec" -name '*.md' | wc -l | tr -d ' ') files"
else
  echo "→ No Chinese spec found, skipping zh-CN sync"
fi

# ── 3. Sync schema and examples to public/ ────────────────────────────
echo "→ Syncing schema and examples..."
mkdir -p "$WEBSITE_DIR/docs/public/schema" "$WEBSITE_DIR/docs/public/examples"

if [ -d "$PROTOCOL_DIR/schema" ]; then
  cp "$PROTOCOL_DIR"/schema/* "$WEBSITE_DIR/docs/public/schema/"
fi

if [ -d "$PROTOCOL_DIR/examples" ]; then
  cp "$PROTOCOL_DIR"/examples/* "$WEBSITE_DIR/docs/public/examples/"
fi

echo ""
echo "Done! Synced files are gitignored in aai-website."
echo "Run 'npm run dev' in aai-website to preview."
