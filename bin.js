#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/extensions */
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import createTranslatedDocument from './src/index.js';
import defaults from './defaults.js';

const { apiService, sourceLang, targetLang, supportedLangs, services } = defaults;

yargs(hideBin(process.argv))
  .command(
    '$0 <filename>',
    'Translates a Markdown document',
    (yArgs) =>
      yArgs
        .positional('filename', {
          describe: 'path to file to translate',
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
        .check(({ api, url }) => {
          if (api === 'ibm' && !url) throw new Error('Using ibm API requires url to be set');
          return true;
        }),
    (argv) => {
      const { filename, verbose, api, source, target, key, url } = argv;

      createTranslatedDocument({
        filePath: filename,
        verbose,
        apiKey: key,
        sourceLang: source,
        targetLang: target,
        apiService: api,
        apiURL: url
      });
    }
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging'
  })
  .parse();
