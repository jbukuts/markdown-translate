/* eslint-disable import/prefer-default-export */
import * as deepl from 'deepl-node';
import { Blob } from 'buffer';
import fetch from 'node-fetch';

// translates html documents
const translateDocument = async (htmlString, options) => {
  const { apiKey, startLang, targetLang, fileName } = options;

  const translator = new deepl.Translator(apiKey);

  // convert to buffer
  const htmlBuffer = Buffer.from(await new Blob([htmlString], { type: 'text/html' }).arrayBuffer());

  // translate via api
  const documentHandle = await translator.uploadDocument(htmlBuffer, startLang, targetLang, {
    formality: 'default',
    filename: `${fileName}.${startLang}.html`
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
};

export { translateDocument };
