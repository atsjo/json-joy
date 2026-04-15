import {cleanupTestbeds} from './setup';

afterEach(() => {
  cleanupTestbeds();
  if (typeof document !== 'undefined') document.body.replaceChildren();
});
