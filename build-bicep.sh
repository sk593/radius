#!/bin/bash

# Directory containing the .bicep files
DIR="test"

# Output directory
OUTPUT_DIR="bicep-build"

# Find all .bicep files in the directory and its subdirectories
FILES=$(find $DIR -name "*.bicep")

# Iterate over all .bicep files
for F in $FILES
do
  # Extract the filename without the extension
  FILENAME=$(basename -- "$F")
  BASENAME="${FILENAME%.*}"

  # Build the output path
  OUTPUT_PATH="$OUTPUT_DIR/$BASENAME.json"

  echo "Building: $F"
  az bicep build --file $F --outfile $OUTPUT_PATH
done