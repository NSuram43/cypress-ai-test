// Page Object Models with TypeScript Annotations

// Base interface for all page objects
interface BasePage {
  visit(): void;
  isLoaded(): void;
}

// Interface for user credentials
interface UserCredentials {
  email: string;
  password: string;
  username?: string;
}

// Interface for product data
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

// Login Page Object with proper annotations
export class LoginPage implements BasePage {
  // Private properties with type annotations
  private readonly emailInput: string = '[data-qa="login-email"]';
  private readonly passwordInput: string = '[data-qa="login-password"]';
  private readonly loginButton: string = '[data-qa="login-button"]';
  private readonly signupLink: string = '[data-qa="signup-button"]';
  private readonly errorMessage: string = '.error-message';

  // Method with void return type
  visit(): void {
    cy.visit('/login');
  }

  // Method with boolean return for assertions
  isLoaded(): void {
    cy.get(this.loginButton).should('be.visible');
    cy.url().should('include', '/login');
  }

  // Method with parameter annotations
  enterCredentials(credentials: UserCredentials): void {
    cy.get(this.emailInput).type(credentials.email);
    cy.get(this.passwordInput).type(credentials.password);
  }

  // Method with string parameter
  enterEmail(email: string): void {
    cy.get(this.emailInput).clear().type(email);
  }

  // Method with string parameter
  enterPassword(password: string): void {
    cy.get(this.passwordInput).clear().type(password);
  }

  // Method returning Cypress chainable
  clickLogin(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(this.loginButton).click();
  }

  // Method for complete login flow
  login(credentials: UserCredentials): void {
    this.enterCredentials(credentials);
    this.clickLogin();
  }

  // Method returning string for validation
  getErrorMessage(): Cypress.Chainable<string> {
    return cy.get(this.errorMessage).invoke('text');
  }

  // Method with boolean parameter
  verifyLoginSuccess(shouldSucceed: boolean = true): void {
    if (shouldSucceed) {
      cy.url().should('not.include', '/login');
      cy.get('li a').contains('Logged in as').should('be.visible');
    } else {
      cy.get(this.errorMessage).should('be.visible');
    }
  }
}

// Product Page Object with generics and advanced annotations
export class ProductPage implements BasePage {
  private readonly productContainer: string = '.product-item';
  private readonly addToCartButton: string = '[data-qa="add-to-cart"]';
  private readonly productTitle: string = '.product-title';
  private readonly productPrice: string = '.product-price';
  private readonly categoryFilter: string = '.category-filter';

  visit(): void {
    cy.visit('/products');
  }

  isLoaded(): void {
    cy.get(this.productContainer).should('be.visible');
    cy.url().should('include', '/products');
  }

  // Method with generic type parameter
  selectProductByName<T extends string>(productName: T): void {
    cy.contains(this.productContainer, productName).click();
  }

  // Method with union type parameter
  selectProductById(productId: number | string): void {
    cy.get(`[data-product-id="${productId}"]`).click();
  }

  // Method returning array type
  getAllProductNames(): Cypress.Chainable<string[]> {
    return cy.get(this.productTitle).then(($elements) => {
      const names: string[] = [];
      $elements.each((index, element) => {
        names.push(element.innerText);
      });
      return names;
    });
  }

  // Method with object parameter
  filterByCategory(category: { name: string; id: number }): void {
    cy.get(this.categoryFilter).select(category.name);
  }

  // Method returning Promise for async operations
  async getProductData(productId: number): Promise<Product> {
    const product: Product = await new Promise((resolve) => {
      cy.get(`[data-product-id="${productId}"]`).within(() => {
        cy.get(this.productTitle).invoke('text').as('name');
        cy.get(this.productPrice).invoke('text').as('price');
      });
      
      cy.get('@name').then((name) => {
        cy.get('@price').then((price) => {
          resolve({
            id: productId,
            name: name as string,
            price: parseFloat((price as string).replace('$', '')),
            category: 'default'
          });
        });
      });
    });
    
    return product;
  }

  // Method with optional parameters
  addToCart(quantity: number = 1, size?: string): void {
    if (size) {
      cy.get(`[data-size="${size}"]`).click();
    }
    
    if (quantity > 1) {
      cy.get('[data-qa="quantity"]').clear().type(quantity.toString());
    }
    
    cy.get(this.addToCartButton).click();
  }
}

// Shopping Cart Page with complex type annotations
export class ShoppingCartPage implements BasePage {
  private readonly cartItems: string = '.cart-item';
  private readonly removeButton: string = '[data-qa="remove-item"]';
  private readonly quantityInput: string = '[data-qa="quantity-input"]';
  private readonly totalPrice: string = '.total-price';
  private readonly checkoutButton: string = '[data-qa="checkout"]';

  visit(): void {
    cy.visit('/cart');
  }

  isLoaded(): void {
    cy.get(this.cartItems).should('exist');
    cy.url().should('include', '/cart');
  }

  // Method with tuple return type
  getCartSummary(): Cypress.Chainable<[number, number]> {
    return cy.get(this.cartItems).then(($items) => {
      const itemCount: number = $items.length;
      return cy.get(this.totalPrice).invoke('text').then((totalText) => {
        const total: number = parseFloat((totalText as string).replace('$', ''));
        return [itemCount, total] as [number, number];
      });
    });
  }

  // Method with callback parameter
  verifyCartItems(validator: (items: JQuery<HTMLElement>) => boolean): void {
    cy.get(this.cartItems).should(($items) => {
      expect(validator($items)).to.be.true;
    });
  }

  // Method with mapped type parameter
  updateQuantities(updates: Record<string, number>): void {
    Object.entries(updates).forEach(([productId, quantity]) => {
      cy.get(`[data-product-id="${productId}"] ${this.quantityInput}`)
        .clear()
        .type(quantity.toString());
    });
  }
}

// Utility functions with proper type annotations
export const PageHelpers = {
  // Function with function type parameter
  waitForElement(selector: string, timeout: number = 5000): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(selector, { timeout });
  },

  // Function with rest parameters
  verifyTexts(...expectedTexts: string[]): void {
    expectedTexts.forEach((text) => {
      cy.contains(text).should('be.visible');
    });
  },

  // Function with conditional return type
  getElementText<T extends boolean>(
    selector: string, 
    asArray: T
  ): T extends true ? Cypress.Chainable<string[]> : Cypress.Chainable<string> {
    if (asArray) {
      return cy.get(selector).then(($els) => 
        Array.from($els).map(el => el.innerText)
      ) as any;
    } else {
      return cy.get(selector).invoke('text') as any;
    }
  }
};

// Export type definitions for use in tests
export type { UserCredentials, Product, BasePage };