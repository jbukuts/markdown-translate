/* eslint-disable no-console */
/* eslint-disable import/extensions */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeRaw from 'rehype-raw';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import remarkMdx from 'remark-mdx';
import { translateDocDeepL, translateIBM } from './translate/index.js';
import defaults from '../defaults.js';
import rehypeTagElements from './plugins/rehypeTagElements.js';
import rehypeReplaceTaggedItems from './plugins/rehypeReplaceTaggedItems.js';
import remarkTagElements from './plugins/remarkTagElements.js';
import themes from './themes.js';
import remarkTrailingWhitespace from './plugins/remarkTrailingWhitespace.js';

const { info, error } = themes;
const serviceMap = {
  deepl: translateDocDeepL,
  ibm: translateIBM
};

/**
 * Translates Markdown content to another language.
 * @param {string} markdownString - string containing Markdown content.
 * @param {Object} options - options for translating the Markdown content.
 * @param {boolean} [options.verbose=] - toggles verbose logging.
 * @param {string} [options.fileName=] - file name for Mardown document.
 * @param {string} [options.sourceLang=] - source language of content.
 * @param {string} [options.targetLang=] - target language to translate to.
 * @param {string} [options.apiService=] - API service to use when translating content.
 * @param {string} options.apiKey - API key used for selected service.
 * @param {string} [options.apiURL=] - URL of instance of IBM Translator service. Only needed in that context.
 */
const createTranslatedDocument = async (markdownString, options) => {
  const { fileName, sourceLang, targetLang, apiService, apiKey, apiURL } = {
    fileName: 'output',
    apiService: defaults.apiService,
    sourceLang: defaults.sourceLang,
    targetLang: defaults.targetLang,
    ...options
  };

  const dontTranslate = ['code'];
  const dontTranslateRemark = ['mdxJsxFlowElement'];

  try {
    // pull frontmatter out
    console.log(info.bold(fileName), info('- stripping frontmatter data from file'));
    const { content: rawMarkdown, data: frontmatter } = matter(markdownString);

    const mappedRemarkNodes = new Map();
    const mappedRehypeNodes = new Map();

    // transform to html string
    console.log(info.bold(fileName), info('- transforming from Markdown to HTML'));
    const htmlString = String(
      await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMdx)
        .use(remarkTagElements, { map: mappedRemarkNodes, tags: dontTranslateRemark })
        .use(remarkRehype, {
          allowDangerousHtml: true,
          passThrough: ['html']
        })
        .use(rehypeDocument)
        .use(rehypeFormat)
        .use(rehypeTagElements, { map: mappedRehypeNodes, tags: dontTranslate })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(rawMarkdown)
    );

    // use specified translation service
    console.log(info.bold(fileName), info('- sending document off for translation'));
    const translateDocument = serviceMap[apiService];
    const responseDoc = await translateDocument(htmlString, {
      apiURL,
      apiKey,
      sourceLang,
      targetLang,
      fileName
    });
    console.log(info.bold(fileName), info('- translated document retrieved'));

    // convert html back to markdown
    console.log(info.bold(fileName), info('- transforming back to Markdown'));
    const transMarkdownString = String(
      await unified()
        .use(rehypeRaw)
        .use(rehypeFormat)
        .use(rehypeReplaceTaggedItems, { map: mappedRehypeNodes })
        .use(rehypeParse)
        .use(rehypeRemark, {
          handlers: {
            'mdx-placeholder-element': (_, node) => {
              const {
                properties: { dataTagId }
              } = node;

              return mappedRemarkNodes.get(dataTagId);
            }
          }
        })
        .use(remarkGfm)
        .use(remarkMdx)
        .use(remarkTrailingWhitespace)
        .use(remarkStringify)
        .process(responseDoc)
    );

    // reattach frontmatter data
    return matter.stringify(transMarkdownString, frontmatter);
  } catch (err) {
    console.log(error(fileName), error('- error occurred during document translation'));
    console.log(error(err));
    return null;
  }
};

export default createTranslatedDocument;
