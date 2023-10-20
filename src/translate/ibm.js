/* eslint-disable no-promise-executor-return */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/extensions */
import LanguageTranslatorV3 from 'ibm-watson/language-translator/v3.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import fetch from 'node-fetch';
import { Blob } from 'buffer';

const VERSION = '2018-05-01';

/**
 * Helper function to sleep thread.
 * @param {number} ms - milliseconds to wait for.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Translates HTML document using IBM Translator.
 * @param {string} htmlString - represents HTML document to be translated.
 * @param {Object} options - options for translating the HTML document.
 * @param {string} options.apiKey - API key used for IBM Translator.
 * @param {string} options.sourceLang - source language of content.
 * @param {string} options.targetLang - target language to translate to.
 * @param {string} options.fileName - file name of document.
 * @param {string} options.apiURL - URL of instance of IBM Translator service.
 */
const translateDocument = async (htmlString, options) => {
  const { apiKey, apiURL, sourceLang, targetLang, fileName } = options;

  try {
    const languageTranslator = new LanguageTranslatorV3({
      authenticator: new IamAuthenticator({ apikey: apiKey }),
      serviceUrl: apiURL,
      version: VERSION
    });

    const htmlBuffer = Buffer.from(
      await new Blob([htmlString], { type: 'text/html' }).arrayBuffer()
    );

    // upload document
    const documentHandle = await languageTranslator.translateDocument({
      file: htmlBuffer,
      filename: `${fileName}.${sourceLang}.html`,
      fileContentType: 'text/html',
      source: sourceLang,
      target: targetLang
    });

    if (documentHandle.status !== 200)
      throw new Error(`There was an error uploading document ${documentHandle.status}`);

    // await translation
    const {
      result: { document_id: documentId }
    } = documentHandle;

    let documentStatus = await languageTranslator.getDocumentStatus({
      documentId
    });

    while (documentStatus.result.status !== 'available' && documentStatus.status === 200) {
      await sleep(5000);
      documentStatus = await languageTranslator.getDocumentStatus({ documentId });
    }

    // get translated document
    const responseDoc = await fetch(
      `${apiURL}/v3/documents/${documentId}/translated_document?version=${VERSION}`,
      {
        method: 'GET',
        headers: {
          Accept: 'text/html',
          Authorization: `Basic ${btoa(`apikey:${apiKey}`)}`
        }
      }
    ).then((r) => r.text());

    return responseDoc;
  } catch (err) {
    console.error(err.message);
    return null;
  }
};

export { translateDocument };
