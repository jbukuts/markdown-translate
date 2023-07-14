import { Translator } from 'deepl-node';
import fetch, { Response } from 'node-fetch';
import { translateDocument } from '../../../src/translate/deepl';

jest.mock('deepl-node');
jest.mock('node-fetch', () => ({
  __esModule: true,
  ...jest.requireActual('node-fetch'),
  default: jest.fn()
}));

const mockOptions = {
  apiKey: 'test_key',
  sourceLang: 'en',
  targetLang: 'es',
  fileName: 'test.md'
};

describe('DeepL API', () => {
  test('Can return string successfully', async () => {
    const testText = 'test';

    Translator.mockImplementation(() => ({
      uploadDocument: jest.fn().mockReturnValue({ documentId: 'test_id', documentKey: 'test_key' }),
      isDocumentTranslationComplete: jest.fn().mockReturnValue({ status: { status: 'done' } })
    }));

    fetch.mockResolvedValueOnce(
      Promise.resolve(
        new Response(testText, {
          status: 200,
          statusText: 'ok'
        })
      )
    );

    const test = await translateDocument('<h1>test</h1>', mockOptions);
    expect(test).toBe(testText);
  });

  test('Will throw error on translation', async () => {
    Translator.mockImplementation(() => ({
      uploadDocument: jest.fn().mockReturnValue({ documentId: 'test_id', documentKey: 'test_key' }),
      isDocumentTranslationComplete: jest.fn().mockReturnValue({ status: { status: 'error' } })
    }));

    const test = await translateDocument('<h1>test</h1>', mockOptions);

    expect(test).toBe(null);
  });
});
