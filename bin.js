#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/extensions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import defaults from './defaults.js';

const { apiService, sourceLang, targetLang, supportedLangs, services } = defaults;

/**
 * Return array of known path string for md files
 * @param {string} pathString - initial unknown path string
 */
const determineFileArray = (pathString) => {
  const isList = pathString.includes(',');

  // if its a list ensure they all exists
  if (isList) {
    console.log(pathString);
    const splitPaths = pathString.split(',').map((p) => p.trim());
    const nonExistent = splitPaths.filter((p) => !fs.existsSync(p));
    if (nonExistent.length > 0) throw new Error(`files ${nonExistent} do not exist!`);

    return splitPaths;
  }

  // ensure file or folder exists
  const exists = fs.existsSync(pathString);
  if (!exists) throw new Error(`file ${pathString} does not exist!`);

  // check if folder, if not return string
  const isFolder = fs.lstatSync(pathString).isDirectory();
  if (!isFolder) return [pathString];

  // if folder traverse for all md files
  const files = fs.readdirSync(pathString);

  return files
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      console.log(`-- Found ${f}`);
      return path.join(pathString, f);
    });
};

yargs(hideBin(process.argv))
  .command(
    '$0 <filename>',
    'Translates a Markdown document',
    (yArgs) =>
      yArgs
        .positional('filename', {
          describe: 'path to file(s) of folder to translate',
          type: 'string',
          normalize: true
        })
        .option('api', {
          describe: 'API service to use for translating document',
          choices: services,
          default: apiService
        })
        .option('key', {
          alias: 'k',
          type: 'string',
          describe: 'API key for selected service',
          demandOption: true
        })
        .option('source', {
          alias: 's',
          choices: supportedLangs,
          describe: 'Source language of document',
          default: sourceLang
        })
        .option('url', {
          alias: 'u',
          type: 'string',
          describe: 'Service URL for IBM Cloud Translate instance'
        })
        .option('target', {
          alias: 't',
          choices: supportedLangs,
          describe: 'Target language to translate document to',
          default: targetLang
        })
        .check((argv) => {
          const { api, url, filename } = argv;
          if (api === 'ibm' && !url) throw new Error('Using ibm API requires url to be set');

          // eslint-disable-next-line no-param-reassign
          argv.remappedFilenames = determineFileArray(filename);

          return true;
        }),
    async (argv) => {
      const { verbose, api, source, target, key, url, remappedFilenames } = argv;

      // await for all threads to resolve
      await new Promise((resolve, reject) => {
        let count = remappedFilenames.length;

        remappedFilenames.forEach((file) => {
          // create worker and start thread
          const worker = new Worker('./worker.js');
          worker.postMessage({ filename: file, verbose, key, source, target, api, url });

          // listen for end message
          worker.on('message', (data) => {
            if (data === null) reject(new Error('Error translating document'));

            // we know were done
            count -= 1;
            if (count <= 0) {
              console.log('Done translating documents!');
              resolve();
            }
          });
        });
      });

      process.exit(0);
    }
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse();
