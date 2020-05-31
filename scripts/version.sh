#!/bin/sh -eu
echo "{"
echo "  \"timestamp\": `date +%s`,"
echo "  \"date\": \"`date -R`\","
echo "  \"hash\": \"`git describe --tags --dirty`\""
echo "}"
