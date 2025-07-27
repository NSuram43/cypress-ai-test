import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// This is a prerequisite step for tests that require a logged-in state, like logout.
Given('I am logged in', () => {
  cy.visit('/login');
  // Use the custom login command and credentials from cypress.env.json
  cy.login(Cypress.env('email'), Cypress.env('password'));
  // A quick assertion to ensure the login was successful before proceeding.
  cy.get('li a').contains('Logged in as').should('be.visible');
});

Given('I am on the login page', () => {
  cy.visit('/login');
});

When('I enter valid credentials', () => {
  // Use the custom login command and credentials from cypress.env.json
  cy.login(Cypress.env('email'), Cypress.env('password'));
});

When(
  'I enter email {string} and password {string}',
  (email: string, password: string) => {
    // The `if` conditions prevent errors if the example table has empty values.
    if (email) {
      cy.get('[data-qa="login-email"]').type(email);
    }
    if (password) {
      cy.get('[data-qa="login-password"]').type(password);
    }
  }
);

When('I click the login button', () => {
  cy.get('[data-qa="login-button"]').click();
});

When('I click the logout button', () => {
  cy.get('a[href="/logout"]').click();
});

Then('I should be logged in successfully', () => {
  // Asserting against visible text that confirms login status is more reliable
  // than just checking the URL.
  cy.get('li a').contains('Logged in as').should('be.visible');
});

Then('I should be redirected to the login page', () => {
  cy.url().should('include', '/login');
  // Also assert that a key element of the login page is visible.
  cy.get('.login-form h2').should('contain.text', 'Login to your account');
});

Then(
  'I should see the login error message {string}',
  (errorMessage: string) => {
    cy.get('.login-form p')
      .should('be.visible')
      .and('have.css', 'color', 'rgb(255, 0, 0)') // Verifying the error color is a good UI check.
      .and('contain.text', errorMessage);
  }
);
