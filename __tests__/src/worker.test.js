import fs from 'fs';
import path from 'path';
import { parentPort } from 'worker_threads';
import '../../src/worker';
import createTranslatedDocument from '../../src/index';

jest.mock('path');
jest.mock('fs');

jest.mock('../../src/index');

describe('worker', () => {
  test('that worker can run when event emitted', async () => {
    fs.readFileSync.mockReturnValue('# Test Heading');
    path.parse.mockReturnValue({ name: 'test' });

    createTranslatedDocument.mockReturnValueOnce('#Test');

    parentPort.send({ name: 'test', targetLang: 'es', filePath: '', index: 0 });

    return new Promise((resolve) => {
      parentPort.recieve((data) => {
        const { outputFile, index } = data;

        expect(index).toBe(0);
        expect(outputFile).toBe(`./test.es.md`);
        expect(fs.writeFileSync).toHaveBeenCalled();
        resolve();
      });
    });
  });

  test('that worker can run when event emitted without writing output to file', async () => {
    fs.readFileSync.mockReturnValue('# Test Heading');
    path.parse.mockReturnValue({ name: 'test' });

    createTranslatedDocument.mockReturnValueOnce(null);

    parentPort.send({ name: 'test', targetLang: 'es', filePath: '', index: 0 });

    return new Promise((resolve) => {
      parentPort.recieve((data) => {
        const { outputFile, index } = data;
        fs.writeFileSync.mockClear();

        expect(index).toBe(0);
        expect(outputFile).toBe(`./test.es.md`);
        expect(fs.writeFileSync).not.toHaveBeenCalled();
        resolve();
      });
    });
  });
});
