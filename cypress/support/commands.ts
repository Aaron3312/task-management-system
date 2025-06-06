/// <reference types="cypress" />
// ***********************************************
// Este archivo muestra cómo crear comandos personalizados.
// Documentación oficial: https://on.cypress.io/custom-commands
// ***********************************************

// -- Comandos personalizados de ejemplo --
// Cypress.Commands.add('login', (email, password) => { ... })
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// ✅ Nuevo comando personalizado: espera hasta que un elemento sea visible
Cypress.Commands.add('waitForVisible', (selector: string, timeout = 10000) => {
  return cy.get(selector, { timeout }).should('exist').and('be.visible');
});

// ✅ Extiende los tipos de Cypress para incluir `waitForVisible`
declare global {
namespace Cypress {
    interface Chainable {
      waitForVisible(selector: string, timeout?: number): Chainable<JQuery<HTMLElement>>;
      login(email: string, password: string): Chainable<void>;
      drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
      dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>;
    }
  }
}

export {};
