#!/bin/bash
# Push local SQLite database to Turso.
#
# Prerequisites:
#   1. Install Turso CLI: brew install tursodatabase/tap/turso
#   2. Login: turso auth login
#   3. Create a database: turso db create living-word
#   4. Set env vars (or pass as args):
#      TURSO_DB_NAME=living-word
#
# Usage:
#   ./scripts/push-to-turso.sh [db-name]

set -euo pipefail

DB_NAME="${1:-${TURSO_DB_NAME:-living-word}}"
LOCAL_DB="data/bible.db"
DUMP_FILE="data/bible-dump.sql"

echo "╔══════════════════════════════════════════════╗"
echo "║   Push Local DB → Turso                     ║"
echo "╚══════════════════════════════════════════════╝"
echo

# Check prerequisites
if ! command -v turso &> /dev/null; then
  echo "❌ Turso CLI not found. Install with: brew install tursodatabase/tap/turso"
  exit 1
fi

if [ ! -f "$LOCAL_DB" ]; then
  echo "❌ Local database not found at $LOCAL_DB"
  echo "   Run 'npm run db:seed' first to create it."
  exit 1
fi

# Dump local SQLite
echo "📦 Dumping local database..."
sqlite3 "$LOCAL_DB" .dump > "$DUMP_FILE"
echo "   ✓ Dump created: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"

# Push to Turso
echo "🚀 Pushing to Turso database: $DB_NAME"
turso db shell "$DB_NAME" < "$DUMP_FILE"
echo "   ✓ Data pushed successfully!"

# Show connection info
echo
echo "📋 Connection details:"
TURSO_URL=$(turso db show "$DB_NAME" --url 2>/dev/null || echo "Run: turso db show $DB_NAME --url")
echo "   TURSO_DATABASE_URL=$TURSO_URL"
echo "   TURSO_AUTH_TOKEN=<run: turso db tokens create $DB_NAME>"
echo
echo "✅ Done! Add these to your Vercel environment variables."

# Cleanup
rm -f "$DUMP_FILE"
