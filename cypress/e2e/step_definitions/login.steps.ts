import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given('I am on the login page', () => {
  cy.visit('https://www.automationexercise.com/login');
});

When('I enter valid credentials', () => {
  cy.get('[data-qa="login-email"]').type('reddy21@gmail.com');
  cy.get('[data-qa="login-password"]').type('test');
  cy.get('[data-qa="login-button"]').click();
});

Then('I should see the dashboard', () => {
  cy.url().should('eq', 'https://www.automationexercise.com/');
});
