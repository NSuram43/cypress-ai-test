Feature: Product Interaction
  As a logged-in user, I want to interact with products so that I can purchase them.

  Background:
    Given I am logged in

  Scenario: User can search for a specific product
    When I navigate to the products page
    And I search for "Blue Top"
    Then I should see the "Searched Products" title
    And the product list should show items related to "Blue Top"

  Scenario: User can add a product to the cart and verify it
    When I navigate to the products page
    And I add the "Blue Top" product to the cart
    And I click on "View Cart" in the modal
    Then I should see "Blue Top" in the cart