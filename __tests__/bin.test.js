import { execFileSync } from 'child_process';

const runCommand = async (...args) => {
  const argv = ['bin.js', ...args];
  const stdout = execFileSync('node', argv);
  return Buffer.isBuffer(stdout) ? Buffer.from(stdout).toString() : stdout;
};

describe('bin', () => {
  test('test cli and ensure help message prints', async () => {
    const output = await runCommand('--help');

    expect(output).toContain('bin.js <filename>');
  });
});
