import { translateIBM, translateDocDeepL } from '../../src/translate/index';

import createTranslatedDocument from '../../src/index';

jest.mock('../../src/translate/index');

describe('createTranslatedDocument', () => {
  test('can translate document without verbose', async () => {
    // mock APIs
    translateDocDeepL.mockImplementation(() => '<h1>Test Header</h1>\n<mdx-placeholder-element/>');
    translateIBM.mockImplementation(() => '<h1>Test Header</h1>\n<mdx-placeholder-element/>');

    const output = await createTranslatedDocument('# Test Header', {
      fileName: 'test',
      verbose: false,
      startLang: 'en',
      targetLang: 'es',
      apiService: 'ibm',
      apiKey: '',
      apiURL: ''
    });

    expect(output).toBe('# Test Header\n');
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
