#!/usr/bin/env bash

# HashLog verification script.
# Runs the backend test suite and verifies that the frontend production build works.

set -Eeuo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Keep pytest temporary files inside the project for Windows/Git Bash compatibility.
TEST_TMP="$PROJECT_ROOT/.tmp"
mkdir -p "$TEST_TMP"
export TMPDIR="$TEST_TMP"
export TEMP="$TEST_TMP"
export TMP="$TEST_TMP"

echo "========================================"
echo " HashLog: backend tests"
echo "========================================"
if [ -x "$PROJECT_ROOT/backend/.venv/bin/python" ]; then
  PYTHON="$PROJECT_ROOT/backend/.venv/bin/python"
else
  PYTHON="$(command -v python3 || command -v python)"
fi

if ! "$PYTHON" -c "import pytest, httpx" >/dev/null 2>&1; then
  echo "Installing backend dev dependencies into $PYTHON ..."
  "$PYTHON" -m pip install -q -r backend/requirements-dev.txt
fi

"$PYTHON" -m pytest -q -p no:cacheprovider backend/tests

echo
echo "========================================"
echo " HashLog: frontend production build"
echo "========================================"
(
  cd frontend
  npm run build
)

echo
echo "========================================"
echo " ALL HASHLOG CHECKS PASSED"
echo "========================================"
