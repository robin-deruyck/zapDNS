#!/bin/bash

set -e

node --experimental-sea-config sea-config.json

cd dist

cp "$(command -v node)" zapdns.exe

npx postject zapdns.exe NODE_SEA_BLOB zapdns.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2

echo "Build completed successfully."
