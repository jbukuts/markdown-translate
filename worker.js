/* eslint-disable no-console */
/* eslint-disable import/extensions */
import { parentPort } from 'worker_threads';
import path from 'path';
import fs from 'fs';
import createTranslatedDocument from './src/index.js';

parentPort.on('message', async (data) => {
  const { filename, verbose, key, source, target, api, url } = data;

  const { name } = path.parse(filename);
  const markdownString = fs.readFileSync(filename, 'utf8');

  try {
    const output = await createTranslatedDocument(markdownString, {
      fileName: name,
      verbose,
      apiKey: key,
      sourceLang: source,
      targetLang: target,
      apiService: api,
      apiURL: url
    });

    const outputFile = `./${name}.${target}.md`;
    fs.writeFileSync(outputFile, output);

    parentPort.postMessage(true);
  } catch (e) {
    console.log(e);
    parentPort.postMessage(null);
  }
});
