/* eslint-disable import/prefer-default-export */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/extensions */
import LanguageTranslatorV3 from 'ibm-watson/language-translator/v3.js';
import { IamAuthenticator } from 'ibm-watson/auth/index.js';
import fetch from 'node-fetch';
import { Blob } from 'buffer';

const VERSION = '2018-05-01';

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const translateDocument = async (htmlString, options) => {
  const { apiKey, apiURL, startLang, targetLang, fileName } = options;

  const languageTranslator = new LanguageTranslatorV3({
    authenticator: new IamAuthenticator({ apikey: apiKey }),
    serviceUrl: apiURL,
    version: VERSION
  });

  const htmlBuffer = Buffer.from(await new Blob([htmlString], { type: 'text/html' }).arrayBuffer());

  // upload document
  const documentHandle = await languageTranslator.translateDocument({
    file: htmlBuffer,
    filename: `${fileName}.${startLang}.html`,
    fileContentType: 'text/html',
    source: startLang,
    target: targetLang
  });

  if (documentHandle.status !== 200)
    throw new Error(`There was an error uploading document ${documentHandle.status}`);

  console.log('Successfully uploaded document!');

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
};

export { translateDocument };
