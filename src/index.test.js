import { writeFileSync, readFileSync } from 'fs';
import { parse } from 'path';
import { translateIBM, translateDocDeepL } from './translate/index';

import createTranslatedDocument from './index';

jest.mock('./translate/index.js');
jest.mock('fs');
jest.mock('path');

describe('createTranslatedDocument', () => {
  test('can translate document without verbose', async () => {
    // mock APIs
    translateDocDeepL.mockImplementation(() => '<h1>Test</h1>');
    translateIBM.mockImplementation(() => '<h1>Test</h1>');

    const write = jest.fn();

    // mock file IO
    parse.mockReturnValue({ name: 'test file' });
    readFileSync.mockReturnValue('# Test Header');
    writeFileSync.mockImplementation(write);

    await createTranslatedDocument({
      filePath: './',
      verbose: false,
      startLang: 'en',
      targetLang: 'es',
      apiService: 'ibm',
      apiKey: '',
      apiURL: ''
    });

    expect(write).toHaveBeenCalled();
  });
});
