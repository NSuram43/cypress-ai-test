import { When, Then } from '@badeball/cypress-cucumber-preprocessor';

When('I navigate to the products page', () => {
  // Click the 'Products' button in the header
  cy.get('a[href="/products"]').click();
  // Assert that we've landed on the correct page before proceeding
  cy.url().should('include', '/products');
  cy.contains('h2', 'All Products').should('be.visible');
});

When('I search for {string}', (productName: string) => {
  cy.get('#search_product').type(productName);
  cy.get('#submit_search').click();
});

Then('I should see the {string} title', (title: string) => {
  cy.get('.title.text-center').should('be.visible').and('contain.text', title);
});

Then(
  'the product list should show items related to {string}',
  (productName: string) => {
    cy.get('.features_items .product-image-wrapper').should(
      'have.length.gt',
      0
    );
    // Check that the visible product card contains the searched product name
    cy.get('.features_items .productinfo p')
      .first()
      .should('contain.text', productName);
  }
);

When('I add the {string} product to the cart', (productName: string) => {
  // Find the product by its name and click the corresponding 'Add to cart' button
  cy.contains('.productinfo p', productName)
    .parents('.product-image-wrapper')
    .find('a.add-to-cart') // This finds two buttons (one visible, one in the hover overlay)
    .first() // We select the first one, which is the correct one to click
    .click();
});

When('I click on {string} in the modal', (linkText: string) => {
  // The "View Cart" link is in the modal's footer, not its body.
  // We also ensure the modal is visible before trying to click inside it.
  cy.get('#cartModal .modal-content')
    .should('be.visible')
    .contains('a', linkText)
    .click();
});

Then('I should see {string} in the cart', (productName: string) => {
  cy.url().should('include', '/view_cart');
  cy.get('td.cart_description a').should('contain.text', productName);
});
