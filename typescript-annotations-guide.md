# TypeScript Annotations Guide for Cypress Automation Framework

## **What are TypeScript Annotations?**

**Simple Definition for Interviews:**
TypeScript annotations are explicit type declarations that tell TypeScript what type of data a variable, parameter, function return value, or property should be. They provide compile-time type checking and better IDE support.

## **Why Use TypeScript Annotations?**

### **Interview-Ready Benefits:**
1. **Type Safety**: Catch errors at compile time, not runtime
2. **Better IDE Support**: IntelliSense, auto-completion, refactoring
3. **Code Documentation**: Self-documenting code with clear contracts
4. **Maintainability**: Easier to understand and modify code
5. **Team Collaboration**: Clear expectations for function inputs/outputs

## **Types of Annotations in Cypress Framework**

### **1. Variable Annotations**

```typescript
// Basic type annotations
const baseUrl: string = 'https://www.automationexercise.com';
const timeout: number = 10000;
const isVisible: boolean = true;
const testData: string[] = ['user1', 'user2', 'user3'];

// In Cypress context
const locators: Record<string, string> = {
  loginEmail: '[data-qa="login-email"]',
  loginPassword: '[data-qa="login-password"]',
  loginButton: '[data-qa="login-button"]'
};
```

### **2. Function Parameter Annotations**

```typescript
// Cypress custom command with annotations
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.get('[data-qa="login-email"]').type(email);
  cy.get('[data-qa="login-password"]').type(password);
  cy.get('[data-qa="login-button"]').click();
});

// Cucumber step definition with annotations
When('I enter email {string} and password {string}', 
  (email: string, password: string) => {
    if (email) {
      cy.get('[data-qa="login-email"]').type(email);
    }
    if (password) {
      cy.get('[data-qa="login-password"]').type(password);
    }
  }
);
```

### **3. Function Return Type Annotations**

```typescript
// Function that returns Cypress chainable
function getLoginButton(): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get('[data-qa="login-button"]');
}

// Function returning promise
async function setupTestData(): Promise<void> {
  // Setup logic here
}

// Function returning specific type
function getTestConfig(): { baseUrl: string; timeout: number } {
  return {
    baseUrl: 'https://example.com',
    timeout: 5000
  };
}
```

### **4. Object and Interface Annotations**

```typescript
// Interface for test data
interface UserCredentials {
  email: string;
  password: string;
  username?: string; // Optional property
}

// Interface for page objects
interface LoginPage {
  emailInput: string;
  passwordInput: string;
  loginButton: string;
  visit(): void;
  login(credentials: UserCredentials): void;
}

// Using interfaces in Cypress
const testUser: UserCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

class LoginPageObject implements LoginPage {
  emailInput: string = '[data-qa="login-email"]';
  passwordInput: string = '[data-qa="login-password"]';
  loginButton: string = '[data-qa="login-button"]';

  visit(): void {
    cy.visit('/login');
  }

  login(credentials: UserCredentials): void {
    cy.get(this.emailInput).type(credentials.email);
    cy.get(this.passwordInput).type(credentials.password);
    cy.get(this.loginButton).click();
  }
}
```

### **5. Array and Generic Annotations**

```typescript
// Array annotations
const testCases: string[] = ['valid', 'invalid', 'empty'];
const userIds: number[] = [1, 2, 3, 4, 5];
const mixedData: (string | number)[] = ['test', 123, 'data', 456];

// Generic annotations for reusable functions
function getElement<T>(selector: string): Cypress.Chainable<T> {
  return cy.get(selector);
}

// Generic interface for API responses
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Usage in Cypress
interface User {
  id: number;
  name: string;
  email: string;
}

const userResponse: ApiResponse<User> = {
  data: { id: 1, name: 'John', email: 'john@example.com' },
  status: 200,
  message: 'Success'
};
```

### **6. Cypress-Specific Annotations**

```typescript
// Custom command type declaration
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      selectProduct(productName: string): Chainable<void>;
      verifySuccessMessage(message: string): Chainable<void>;
    }
  }
}

// Cypress configuration with annotations
const config: Cypress.ConfigOptions = {
  e2e: {
    baseUrl: 'https://www.automationexercise.com',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) {
      // Plugin setup
      return config;
    }
  }
};
```

## **Where to Use Annotations in Cypress Framework**

### **1. Custom Commands (`cypress/support/commands.ts`)**
```typescript
Cypress.Commands.add('apiLogin', (credentials: UserCredentials): Cypress.Chainable<any> => {
  return cy.request({
    method: 'POST',
    url: '/api/login',
    body: credentials
  });
});
```

### **2. Page Object Models**
```typescript
export class ProductPage {
  private productSelector: string = '.product-item';
  private addToCartButton: string = '[data-qa="add-to-cart"]';

  selectProduct(productName: string): void {
    cy.contains(this.productSelector, productName).click();
  }

  addToCart(): void {
    cy.get(this.addToCartButton).click();
  }
}
```

### **3. Step Definitions**
```typescript
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

interface StepContext {
  productName?: string;
  quantity?: number;
}

const context: StepContext = {};

Given('I have selected product {string}', (productName: string) => {
  context.productName = productName;
  cy.selectProduct(productName);
});
```

### **4. Configuration Files**
```typescript
// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://www.automationexercise.com',
    specPattern: 'cypress/e2e/**/*.feature',
    async setupNodeEvents(
      on: Cypress.PluginEvents, 
      config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      // Setup logic
      return config;
    }
  }
});
```

## **Common Interview Questions & Answers**

### **Q: What's the difference between type annotations and type inference?**
**A:** Type annotations are explicit type declarations you write (`let name: string`), while type inference is when TypeScript automatically determines the type (`let name = "John"` - TypeScript infers string type).

### **Q: When should you use annotations vs letting TypeScript infer types?**
**A:** Use annotations for:
- Function parameters (required)
- Function return types (for clarity)
- Object properties in interfaces
- When type inference might be unclear
- Public APIs and complex types

### **Q: How do annotations help in Cypress testing?**
**A:** Annotations in Cypress provide:
- Type safety for custom commands
- Better IntelliSense for page objects
- Clear contracts for test data structures
- Compile-time error detection
- Better refactoring support

## **Best Practices for Cypress + TypeScript**

1. **Always annotate function parameters**
2. **Use interfaces for test data structures**
3. **Declare custom command types**
4. **Annotate return types for complex functions**
5. **Use union types for flexible test scenarios**
6. **Leverage generics for reusable components**

## **Key Takeaways for Interviews**

- **Annotations = Explicit type declarations**
- **Purpose = Type safety + Better developer experience**
- **Usage = Variables, functions, objects, arrays**
- **Benefits = Compile-time errors, IntelliSense, documentation**
- **Cypress Context = Custom commands, page objects, test data, configurations**