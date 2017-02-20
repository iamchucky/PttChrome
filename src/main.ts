import { App } from './app';

require('./styles/main.scss');

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});