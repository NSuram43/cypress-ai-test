// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// The application under test (automationexercise.com) has disruptive ads
// that can cause tests to fail. This intercepts ad requests and blocks them,
// leading to a much more stable test run.
beforeEach(() => {
  cy.intercept(
    { hostname: 'pagead2.googlesyndication.com' },
    { statusCode: 204 }
  );
  cy.intercept(
    { hostname: 'googleads.g.doubleclick.net' },
    { statusCode: 204 }
  );
});
