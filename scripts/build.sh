#!/bin/bash

# Build all the things
yarn workspaces foreach --exclude '@webexp/config' run build

# Move home page to the root dist directory
mv src/home/dist/ dist/
# TODO: discover why running this into a script creates a duplicate `dist` directory
rm -rf dist/dist/

# Move each experiment into the root dist directory
# experiments_path="src/experiments"
for dir in src/experiments/*; do
  project="$(basename "$dir")"
  mv "$dir/dist/" "dist/$project/"
done
