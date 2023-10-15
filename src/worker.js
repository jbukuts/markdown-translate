/* eslint-disable import/extensions */
import { parentPort } from 'worker_threads';
import path from 'path';
import fs from 'fs';
import createTranslatedDocument from './index.js';

/* istanbul ignore next */
parentPort.on('message', async (data) => {
  const { filePath, verbose, apiKey, sourceLang, targetLang, apiService, apiURL, index } = data;
  const { name } = path.parse(filePath);
  const markdownString = fs.readFileSync(filePath, 'utf8');

  const output = await createTranslatedDocument(markdownString, {
    fileName: name,
    verbose,
    apiKey,
    sourceLang,
    targetLang,
    apiService,
    apiURL
  });

  const outputFile = `./${name}.${targetLang}.md`;
  if (output !== null) fs.writeFileSync(outputFile, output);

  parentPort.postMessage({ outputFile, inputFile: filePath, index });
});
