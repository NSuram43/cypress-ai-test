/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Interface for user credentials
interface UserCredentials {
  email: string;
  password: string;
}

// Interface for API response
interface ApiResponse<T> {
  status: number;
  body: T;
}

//
// -- This is a parent command --
Cypress.Commands.add('login', (email: string, password: string): void => {
  // This validation prevents `cy.type(undefined)` errors if env variables are missing.
  if (typeof email !== 'string' || !email) {
    throw new Error(
      "cy.login() requires a non-empty email string. Check that `Cypress.env('email')` is defined in your cypress.env.json and that there are no conflicting step definition files."
    );
  }
  if (typeof password !== 'string' || !password) {
    throw new Error(
      "cy.login() requires a non-empty password string. Check that `Cypress.env('password')` is defined in your cypress.env.json and that there are no conflicting step definition files."
    );
  }
  cy.get('[data-qa="login-email"]').type(email);
  cy.get('[data-qa="login-password"]').type(password);
  cy.get('[data-qa="login-button"]').click();
});

// Additional custom commands with proper annotations
Cypress.Commands.add('selectProduct', (productName: string): void => {
  cy.contains('.product-item', productName).click();
});

Cypress.Commands.add('verifySuccessMessage', (expectedMessage: string): void => {
  cy.get('.success-message').should('contain.text', expectedMessage);
});

Cypress.Commands.add('apiLogin', (credentials: UserCredentials): Cypress.Chainable<ApiResponse<any>> => {
  return cy.request({
    method: 'POST',
    url: '/api/login',
    body: credentials
  });
});

//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      selectProduct(productName: string): Chainable<void>;
      verifySuccessMessage(expectedMessage: string): Chainable<void>;
      apiLogin(credentials: UserCredentials): Chainable<ApiResponse<any>>;
    }
  }
}
