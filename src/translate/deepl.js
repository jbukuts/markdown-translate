/* eslint-disable import/prefer-default-export */
import * as deepl from 'deepl-node';
import { Blob } from 'buffer';
import fetch from 'node-fetch';

/**
 * Translates HTML document using DeepL API.
 * @param {string} htmlString - represents HTML document to be translated.
 * @param {Object} options - options for translating the HTML document.
 * @param {string} options.apiKey - API key used for DeepL API.
 * @param {string} options.sourceLang - source language of content.
 * @param {string} options.targetLang - target language to translate to.
 * @param {string} options.fileName - file name of document.
 */
const translateDocument = async (htmlString, options) => {
  const { apiKey, sourceLang, targetLang, fileName } = options;

  try {
    const translator = new deepl.Translator(apiKey);

    // convert to buffer
    const htmlBuffer = Buffer.from(
      await new Blob([htmlString], { type: 'text/html' }).arrayBuffer()
    );

    // translate via api
    const documentHandle = await translator.uploadDocument(htmlBuffer, sourceLang, targetLang, {
      formality: 'default',
      filename: `${fileName}.${sourceLang}.html`
    });
    const { status } = await translator.isDocumentTranslationComplete(documentHandle);

    if (status.status !== 'done' || status.errorMessage)
      throw new Error(status.errorMessage || 'Problem translating document');

    // get html doc a string
    const responseDoc = await fetch(
      `https://api-free.deepl.com/v2/document/${documentHandle.documentId}/result`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Authorization: `DeepL-Auth-Key ${apiKey}`
        },
        body: [`document_key=${documentHandle.documentKey}`]
      }
    ).then((r) => r.text());

    return responseDoc;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

export { translateDocument };
