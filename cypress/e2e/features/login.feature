Feature: Login Functionality

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter valid credentials
    Then I should be logged in successfully

  Scenario: User can log out
    Given I am logged in
    When I click the logout button
    Then I should be redirected to the login page

  Scenario Outline: Unsuccessful login with invalid credentials
    Given I am on the login page
    When I enter email "<email>" and password "<password>"
    And I click the login button
    Then I should see the login error message "<errorMessage>"

    Examples:
      | email                  | password       | errorMessage                         |
      | reddy21@gmail.com      | wrongpassword  | Your email or password is incorrect! |
      | non_existent@email.com | anypassword    | Your email or password is incorrect! |