import fs from 'fs';
import path from 'path';
import { parentPort } from 'worker_threads';
import '../../src/worker';

jest.mock('path');
jest.mock('fs');

jest.mock('../../src/index', () => ({
  __esModule: true,
  default: jest.fn().mockReturnValue('# Test')
}));

describe('worker', () => {
  test('that worker can run when event emitted', async () => {
    fs.readFileSync.mockReturnValue('# Test Heading');
    path.parse.mockReturnValue({ name: 'test' });

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
});
