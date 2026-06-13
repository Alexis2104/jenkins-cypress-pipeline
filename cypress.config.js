const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    video: true,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {},
  },
});
