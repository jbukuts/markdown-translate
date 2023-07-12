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
import remarkMdx from 'remark-mdx';
import { translateDocDeepL, translateIBM } from './translate/index.js';
import defaults from '../defaults.js';

const serviceMap = {
  deepl: translateDocDeepL,
  ibm: translateIBM
};

/**
 * Translates Markdown content to another language.
 * @param {Object} options - options for translating the Markdown content.
 * @param {string} options.filePath - file path of Markdown content to translate.
 * @param {boolean} [options.verbose=] - toggles verbose logging.
 * @param {string} [options.sourceLang=] - source language of content.
 * @param {string} [options.targetLang=] - target language to translate to.
 * @param {string} [options.apiService=] - API service to use when translating content.
 * @param {string} options.apiKey - API key used for selected service.
 * @param {string} [options.apiURL=] - URL of instance of IBM Translator service. Only needed in that context.
 * @returns {Promise<void>}
 */
const createTranslatedDocument = async (options) => {
  const { filePath, sourceLang, targetLang, apiService, apiKey, apiURL } = {
    apiService: defaults.apiService,
    sourceLang: defaults.sourceLang,
    targetLang: defaults.targetLang,
    ...options
  };

  const { name } = path.parse(filePath);

  console.log('Reading file');

  // read file as string
  const markdownString = fs.readFileSync(filePath, 'utf8');

  // pull frontmatter out
  console.log('Stripping frontmatter data from file');
  const { content: rawMarkdown, data: frontmatter } = matter(markdownString);

  try {
    // transform to html string
    console.log('Transforming from Markdown to HTML');
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

    const translateDocument = serviceMap[apiService];
    const responseDoc = await translateDocument(htmlString, {
      apiURL,
      apiKey,
      sourceLang,
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

export default createTranslatedDocument;
