#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/extensions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';
import defaults from './defaults.js';
import themes from './src/themes.js';

const { info, success, warning, head } = themes;
const { apiService, sourceLang, targetLang, supportedLangs, services } = defaults;

console.log(head('markdown-translate'));

/**
 * Grab all file paths from a folder
 * @param {string} folderPath - path to existing folder.
 * @returns {string[]}
 */
const getFilesRecursively = (folderPath) => {
  const files = fs.readdirSync(folderPath);

  return files
    .map((f) => {
      const p = path.join(folderPath, f);
      const isFolder = fs.lstatSync(p).isDirectory();
      if (isFolder) return getFilesRecursively(p);
      console.log(info(`-- Found ${p}`));
      return p;
    })
    .flat();
};

/**
 * Return array of known path strings for md files
 * @param {string} pathString - initial unknown path string
 * @returns {string[]}
 */
const determineFileArray = (pathString) => {
  const isList = pathString.includes(',');

  const handleFolder = (p) => {
    // check if folder, if not return string
    const isFolder = fs.lstatSync(p).isDirectory();
    if (!isFolder) return [p];

    const files = getFilesRecursively(p);
    return files.filter((f) => /.*\.md(x?)$/.test(f));
  };

  if (isList) {
    // if its a list ensure they all exists
    const splitPaths = pathString.split(',').map((p) => p.trim());
    const nonExistent = splitPaths.filter((p) => !fs.existsSync(p));
    if (nonExistent.length > 0) throw new Error(`files ${nonExistent} do not exist!`);

    // handle folders as part of list
    const allFilePaths = splitPaths.reduce((acc, curr) => {
      acc.splice(0, 0, ...handleFolder(curr));
      return acc;
    }, []);

    return allFilePaths;
  }

  // ensure file or folder exists
  const exists = fs.existsSync(pathString);
  if (!exists) throw new Error(`file ${pathString} does not exist!`);

  // if folder traverse for all md files
  return handleFolder(pathString);
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
        .option('verbose', {
          alias: 'v',
          type: 'boolean',
          description: 'Run with verbose logging'
        })
        .check((argv) => {
          const { api, url, filename } = argv;
          if (api === 'ibm' && !url) throw new Error('Using ibm API requires url to be set');

          // eslint-disable-next-line no-param-reassign
          argv.remappedFilenames = determineFileArray(filename);

          return true;
        }),
    async (argv) => {
      const { verbose, api, source, target, key, url, remappedFilenames, threads = 4 } = argv;

      const maxWorkers = Math.min(remappedFilenames.length, threads);
      const workers = [...new Array(maxWorkers)].map(() => new Worker('./src/worker.js'));

      const startWorker = (worker, file, index) => {
        worker.postMessage({
          index,
          filePath: file,
          verbose,
          apiKey: key,
          sourceLang: source,
          targetLang: target,
          apiService: api,
          apiURL: url
        });
      };

      console.log(warning.bold('API:'), warning(api));
      console.log(warning.bold('Source language:'), warning(source));
      console.log(warning.bold('Target language:'), warning(target));
      console.log(warning.bold('Total files to translate:'), warning(remappedFilenames.length));

      await Promise.allSettled(
        workers.map((worker, index) => {
          startWorker(worker, remappedFilenames[index], index);

          return new Promise((resolve, reject) => {
            worker.on('message', (finishedData) => {
              const { index: finishedIndex } = finishedData;

              const nextIndex = finishedIndex + maxWorkers;
              if (nextIndex >= remappedFilenames.length) {
                worker.terminate();
                return resolve();
              }

              return startWorker(worker, remappedFilenames[nextIndex], nextIndex);
            });

            worker.on('error', () => reject());
          });
        })
      );

      console.log(success('Done!'));
      process.exit(0);
    }
  )
  .parse();
