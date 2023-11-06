import { mockParentPort } from './mockWorker';

jest.mock('worker_threads', () => ({
  __esModule: true,
  isMainThread: true,
  parentPort: mockParentPort
}));

global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};
