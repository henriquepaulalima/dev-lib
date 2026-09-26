import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dataRoot = join(repositoryRoot, 'db');
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('MONGODB_URI must be set before seeding the database.');
}

const collections = await readdir(dataRoot, { withFileTypes: true });

await mongoose.connect(uri);

try {
  for (const directory of collections.filter((entry) => entry.isDirectory())) {
    const collection = directory.name;
    const collectionPath = join(dataRoot, collection);
    const files = (await readdir(collectionPath))
      .filter((file) => file.endsWith('.data.json'))
      .sort();
    const documents = [];

    for (const file of files) {
      const parsed = JSON.parse(await readFile(join(collectionPath, file), 'utf8'));
      if (!Array.isArray(parsed)) {
        throw new Error(`${join('db', collection, file)} must contain a JSON array.`);
      }
      documents.push(...parsed);
    }

    const target = mongoose.connection.collection(collection);
    await target.deleteMany({});
    if (documents.length > 0) await target.insertMany(documents);
    console.log(`Seeded ${documents.length} documents into ${collection}.`);
  }
} finally {
  await mongoose.disconnect();
}
