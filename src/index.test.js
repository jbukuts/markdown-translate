import { translateIBM, translateDocDeepL } from './translate/index';

import createTranslatedDocument from './index';

jest.mock('./translate/index.js');

describe('createTranslatedDocument', () => {
  test('can translate document without verbose', async () => {
    // mock APIs
    translateDocDeepL.mockImplementation(() => '<h1>Test Header</h1>');
    translateIBM.mockImplementation(() => '<h1>Test Header</h1>');

    const output = await createTranslatedDocument('# Test Header', {
      fileName: 'test',
      verbose: false,
      startLang: 'en',
      targetLang: 'es',
      apiService: 'ibm',
      apiKey: '',
      apiURL: ''
    });

    expect(output).toBe('# Test Header');
  });

  test('can handle error during translation', async () => {
    // mock APIs
    translateDocDeepL.mockImplementation(() => '<h1>Test</h1>');
    translateIBM.mockImplementation(() => {
      throw new Error('test error');
    });

    const output = await createTranslatedDocument('# Test Header', {
      filePath: 'test',
      verbose: false,
      startLang: 'en',
      targetLang: 'es',
      apiService: 'ibm',
      apiKey: '',
      apiURL: ''
    });

    expect(output).toBe(null);
  });
});
