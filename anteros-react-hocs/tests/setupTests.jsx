import 'jest-localstorage-mock';

window.ResizeObserver = class ResizeObserver {
  observe() {}
  disconnect() {}
};
