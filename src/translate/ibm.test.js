/* eslint-disable import/extensions */
import LanguageTranslatorV3 from 'ibm-watson/language-translator/v3.js';
import fetch from 'node-fetch';
import { translateDocument } from './ibm';

jest.mock('ibm-watson/language-translator/v3.js');
jest.mock('node-fetch');

const mockOptions = {
  apiKey: 'test_key',
  sourceLang: 'en',
  targetLang: 'es',
  fileName: 'test.md'
};

describe('IBM Translator API', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test('Can return string successfully', async () => {
    jest.useFakeTimers();

    jest.spyOn(global, 'setTimeout');
    const testText = 'test';

    LanguageTranslatorV3.mockImplementation(() => ({
      translateDocument: jest
        .fn()
        .mockReturnValue({ status: 200, result: { document_id: 'test_id' } }),
      getDocumentStatus: jest
        .fn()
        .mockResolvedValueOnce({ status: 200, result: { status: 'not_available' } })
        .mockResolvedValueOnce({ status: 200, result: { status: 'available' } })
    }));

    fetch.mockResolvedValueOnce(
      Promise.resolve(
        new Response(testText, {
          status: 200,
          statusText: 'ok'
        })
      )
    );

    const test = translateDocument('<h1>test</h1>', mockOptions);

    jest.runAllTimersAsync();

    return test.then((val) => {
      expect(setTimeout).toHaveBeenCalledTimes(1);
      expect(val).toBe(testText);
    });
  });

  test('Will return null on upload error', async () => {
    LanguageTranslatorV3.mockImplementation(() => ({
      translateDocument: jest
        .fn()
        .mockReturnValue({ status: 400, result: { document_id: 'test_id' } }),
      getDocumentStatus: jest.fn()
    }));

    const test = await translateDocument('<h1>test</h1>', mockOptions);

    expect(test).toBe(null);
  });
});
