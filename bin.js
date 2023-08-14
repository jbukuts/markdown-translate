#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/extensions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import fs from 'fs';
import path from 'path';
import defaults from './defaults.js';
import createTranslatedDocument from './src/index.js';

const { apiService, sourceLang, targetLang, supportedLangs, services } = defaults;

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
      console.log(`-- Found ${p}`);
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
        .check((argv) => {
          const { api, url, filename } = argv;
          if (api === 'ibm' && !url) throw new Error('Using ibm API requires url to be set');

          // eslint-disable-next-line no-param-reassign
          argv.remappedFilenames = determineFileArray(filename);

          return true;
        }),
    async (argv) => {
      const { verbose, api, source, target, key, url, remappedFilenames } = argv;

      await Promise.allSettled(
        remappedFilenames.map(async (file) => {
          const { name } = path.parse(file);
          const markdownString = fs.readFileSync(file, 'utf8');

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
        })
      );

      process.exit(0);
    }
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse();
