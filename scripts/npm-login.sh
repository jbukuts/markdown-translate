#!/bin/sh

# Suppress commands (Jenkins turns this on)
set +x

# Suppress color codes from NPM output (for proper grepping)
# export TERM=dumb

# Stop on any error
set -e

echo "Logging in NPM via token"

TOKEN=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

npm config set //registry.npmjs.org/:_authToken=$TOKEN

npm whoami

