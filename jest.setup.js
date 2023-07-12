global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};
