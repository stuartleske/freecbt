#! /usr/bin/env bash
set -e # exit if something goes wrong

# Build Android standalone release
expo build:android --release-channel production --non-interactive --type apk --generate-keystore

# Download the apk
#curl -o app.apk "$(exp url:apk --non-interactive)"
