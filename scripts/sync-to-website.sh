#!/bin/bash
#
# Sync AAI Protocol content to aai-website for VitePress rendering.
#
# Usage:
#   cd aai-protocol
#   bash scripts/sync-to-website.sh
#
# What it does:
#   1. Copies README.md (as index) -> aai-website/docs/index.md
#   2. Copies spec/*.md           -> aai-website/docs/protocol/
#   3. Copies spec/platforms/*.md -> aai-website/docs/protocol/platforms/
#   4. Copies images/             -> aai-website/docs/public/
#   5. Copies schema/ and examples/ -> aai-website/docs/public/
#   6. Adds VitePress frontmatter to each .md file
#   7. Fixes internal links for VitePress routing
#
# The synced files are gitignored in aai-website.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROTOCOL_DIR="$(dirname "$SCRIPT_DIR")"
WEBSITE_DIR="$(dirname "$PROTOCOL_DIR")/aai-website"

# ── Helper Functions ──────────────────────────────────────────────────────

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

fix_links() {
  local file="$1"
  
  # Fix spec internal links for VitePress routing
  # ./README.md -> /
  sed -i '' 's|\[Protocol Specification\](./spec/README.md)|[Protocol Overview](/)|g' "$file"
  sed -i '' 's|\[aai\.json Descriptor\](./aai-json.md)|[aai.json Descriptor](/protocol/aai-json)|g' "$file"
  sed -i '' 's|\[Security Model\](./security.md)|[Security Model](/protocol/security)|g' "$file"
  sed -i '' 's|\[Error Codes\](./error-codes.md)|[Error Codes](/protocol/error-codes)|g' "$file"
  sed -i '' 's|\[Discovery\](./discovery.md)|[Discovery](/protocol/discovery)|g' "$file"
  sed -i '' 's|\[Architecture\](./architecture.md)|[Architecture](/protocol/architecture)|g' "$file"
  sed -i '' 's|\[Back to Spec Index\](./README.md)|[Back to Protocol](/)|g' "$file"
  sed -i '' 's|\[Back to Spec Index\](../README.md)|[Back to Protocol](/)|g' "$file"
  sed -i '' 's|\[Back to Spec Index\](../../README.md)|[Back to Protocol](/)|g' "$file"
  
  # Fix platform links
  sed -i '' 's|\[macOS Platform\](./macos.md)|[macOS](/protocol/platforms/macos)|g' "$file"
  sed -i '' 's|\[Web Platform\](./web.md)|[Web](/protocol/platforms/web)|g' "$file"
  sed -i '' 's|\[macOS\](./macos.md)|[macOS](/protocol/platforms/macos)|g' "$file"
  sed -i '' 's|\[Web\](./web.md)|[Web](/protocol/platforms/web)|g' "$file"
  
  # Fix relative links in platform files
  sed -i '' 's|\[AAI Protocol Overview\](../../README.md)|[Protocol Overview](/)|g' "$file"
  sed -i '' 's|\[Protocol Specification\](../README.md)|[Protocol Overview](/)|g' "$file"
  sed -i '' 's|\[aai\.json Descriptor\](../aai-json.md)|[aai.json Descriptor](/protocol/aai-json)|g' "$file"
  sed -i '' 's|\[Security Model\](../security.md)|[Security Model](/protocol/security)|g' "$file"
  sed -i '' 's|\[Error Codes\](../error-codes.md)|[Error Codes](/protocol/error-codes)|g' "$file"
  
  # Fix image paths
  sed -i '' 's|src="\./images/|src="/|g' "$file"
}

# ── Verify Directories ────────────────────────────────────────────────────

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

# ── 1. Sync README as index.md ────────────────────────────────────────────
echo "→ Syncing README.md as index.md..."
title=$(extract_title "$PROTOCOL_DIR/README.md")
add_frontmatter "$PROTOCOL_DIR/README.md" "$WEBSITE_DIR/docs/index.md" "$title"
fix_links "$WEBSITE_DIR/docs/index.md"
# Remove Quick Links section
awk '/^## Quick Links/{skip=1; next} /^## / && skip{skip=0} skip==0{print}' "$WEBSITE_DIR/docs/index.md" > "$WEBSITE_DIR/docs/index.md.tmp" && mv "$WEBSITE_DIR/docs/index.md.tmp" "$WEBSITE_DIR/docs/index.md"
echo "  Done"

# ── 2. Sync spec/*.md to protocol/ ────────────────────────────────────────
echo "→ Syncing spec/*.md to protocol/..."
mkdir -p "$WEBSITE_DIR/docs/protocol/platforms"

for f in "$PROTOCOL_DIR"/spec/*.md; do
  if [ -f "$f" ]; then
    filename=$(basename "$f")
    # Skip README.md as it's handled separately
    if [ "$filename" != "README.md" ]; then
      title=$(extract_title "$f")
      add_frontmatter "$f" "$WEBSITE_DIR/docs/protocol/$filename" "$title"
      fix_links "$WEBSITE_DIR/docs/protocol/$filename"
    fi
  fi
done

echo "  Processed $(find "$WEBSITE_DIR/docs/protocol" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ') files"

# ── 3. Sync spec/platforms/*.md ───────────────────────────────────────────
echo "→ Syncing spec/platforms/*.md..."
if [ -d "$PROTOCOL_DIR/spec/platforms" ]; then
  for f in "$PROTOCOL_DIR"/spec/platforms/*.md; do
    if [ -f "$f" ]; then
      filename=$(basename "$f")
      title=$(extract_title "$f")
      add_frontmatter "$f" "$WEBSITE_DIR/docs/protocol/platforms/$filename" "$title"
      fix_links "$WEBSITE_DIR/docs/protocol/platforms/$filename"
    fi
  done
  echo "  Processed $(find "$WEBSITE_DIR/docs/protocol/platforms" -name '*.md' | wc -l | tr -d ' ') files"
else
  echo "  No platforms directory found"
fi

# ── 4. Sync images to public/ ──────────────────────────────────────────────
echo "→ Syncing images..."
mkdir -p "$WEBSITE_DIR/docs/public"
if [ -d "$PROTOCOL_DIR/images" ]; then
  cp "$PROTOCOL_DIR"/images/* "$WEBSITE_DIR/docs/public/" 2>/dev/null || true
  echo "  Copied $(ls "$PROTOCOL_DIR"/images/*.{png,jpg,jpeg,gif,svg} 2>/dev/null | wc -l | tr -d ' ') image files"
fi

# ── 5. Sync schema and examples to public/ ──────────────────────────────────
echo "→ Syncing schema and examples..."
mkdir -p "$WEBSITE_DIR/docs/public/schema" "$WEBSITE_DIR/docs/public/examples"

if [ -d "$PROTOCOL_DIR/schema" ]; then
  cp "$PROTOCOL_DIR"/schema/* "$WEBSITE_DIR/docs/public/schema/"
  echo "  Copied schema files"
fi

if [ -d "$PROTOCOL_DIR/examples" ]; then
  cp "$PROTOCOL_DIR"/examples/* "$WEBSITE_DIR/docs/public/examples/"
  echo "  Copied example files"
fi

echo ""
echo "Done! Synced files are tracked in aai-website git repo."
echo "Run 'git add . && git commit' in aai-website to commit changes."
echo "Run 'npm run dev' in aai-website to preview."
