#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable import/extensions */

import fs from 'fs';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import path from 'path';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import remarkMdx from 'remark-mdx';
import { translateDocDeepL, translateIBM } from './translate/index.js';

const SUPPORTED_LANGS = ['en', 'es'];
const DEF_SOURCE_LANG = 'en';
const DEF_TARGET_LANG = 'es';
const DEF_SERVICE = 'ibm';

const serviceMap = {
  deepl: translateDocDeepL,
  ibm: translateIBM
};

// eslint-disable-next-line no-unused-vars
const createTranslatedDocument = async (options) => {
  const { filePath, verbose, startLang, targetLang, apiService, apiKey, apiURL } = options;

  const { name } = path.parse(filePath);

  if (verbose) console.log('Reading file');

  // read file as string
  const markdownString = fs.readFileSync(filePath, 'utf8');

  // pull frontmatter out
  if (verbose) console.log('Stripping frontmatter data from file');
  const { content: rawMarkdown, data: frontmatter } = matter(markdownString);

  try {
    // transform to html string
    if (verbose) console.log('Transforming from Markdown to HTML');
    const htmlString = String(
      await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMdx)
        .use(remarkRehype)
        .use(rehypeDocument)
        .use(rehypeFormat)
        .use(rehypeStringify)
        .process(rawMarkdown)
    );

    console.log(htmlString);

    const translateDocument = serviceMap[apiService];
    const responseDoc = await translateDocument(htmlString, {
      apiURL,
      apiKey,
      startLang,
      targetLang,
      fileName: name
    });

    // convert html back to markdown
    const transMarkdownString = String(
      await unified()
        .use(rehypeParse)
        .use(rehypeRemark)
        .use(remarkGfm)
        .use(remarkMdx)
        .use(remarkStringify)
        .process(responseDoc)
    );

    // write as file
    fs.writeFileSync(
      `./${name}.${targetLang}.md`,
      matter.stringify(transMarkdownString, frontmatter)
    );
  } catch (error) {
    console.log(`Error occurred during document translation: ${error}`);
  }
};

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
          choices: Object.keys(serviceMap),
          default: DEF_SERVICE
        })
        .option('key', {
          alias: 'k',
          type: 'string',
          describe: 'API key for selected service',
          demandOption: true
        })
        .option('source', {
          alias: 's',
          choices: SUPPORTED_LANGS,
          describe: 'Source language of document',
          default: DEF_SOURCE_LANG
        })
        .option('url', {
          alias: 'u',
          type: 'string',
          describe: 'Service URL for IBM Cloud Translate instance'
        })
        .option('target', {
          alias: 't',
          choices: SUPPORTED_LANGS,
          describe: 'Target language to translate document to',
          default: DEF_TARGET_LANG
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
        startLang: source,
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
