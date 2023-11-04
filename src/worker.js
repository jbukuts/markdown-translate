/* eslint-disable no-console */
/* eslint-disable import/extensions */
import { parentPort, isMainThread } from 'worker_threads';
import path from 'path';
import fs from 'fs';
import createTranslatedDocument from './index.js';
import themes from './themes.js';

const { success } = themes;

parentPort.on('message', async (data) => {
  /* istanbul ignore next */
  if (!isMainThread) {
    // write to file descriptor instead of piping to main thread
    console.log = (...message) => {
      fs.writeFileSync(1, `${message.join(' ')}\n`);
    };
    console.error = (...message) => {
      fs.writeFileSync(2, `${message.join(' ')}\n`);
    };
  }

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
  if (output !== null) {
    fs.writeFileSync(outputFile, output);
    console.log(success(`${name} - successfully translated`));
  }

  parentPort.postMessage({ outputFile, inputFile: filePath, index });
});
