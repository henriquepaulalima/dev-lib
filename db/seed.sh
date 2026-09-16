#!/bin/sh
set -eu

for collection_dir in /seed/*; do
  [ -d "$collection_dir" ] || continue

  collection="$(basename "$collection_dir")"
  mongosh "$MONGODB_URI" --quiet --eval "db.getCollection('$collection').deleteMany({})"

  for data_file in "$collection_dir"/*.data.json; do
    [ -f "$data_file" ] || continue
    mongoimport \
      --uri="$MONGODB_URI" \
      --collection="$collection" \
      --file="$data_file" \
      --jsonArray \
      --mode=upsert \
      --upsertFields=slug
  done
done

