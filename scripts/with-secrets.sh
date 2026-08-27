#!/usr/bin/env bash
# Resolve this repository's local CLI secrets through 1Password.
# Values exist only in the child command environment.
set -euo pipefail

if [[ $# -eq 0 ]]; then
	echo "usage: scripts/with-secrets.sh <command> [args...]" >&2
	exit 2
fi

if ! command -v op >/dev/null 2>&1; then
	echo "with-secrets: the 1Password CLI is not installed." >&2
	exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec op run --env-file="$SCRIPT_DIR/secrets/dev.env" -- "$@"
