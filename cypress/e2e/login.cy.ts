describe('Basic test for login', () => {
  before(() => {
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');

    if (!username || !password) {
      throw new Error("❌ No se encontraron las variables de entorno cifradas. Verifica el archivo cypress.env.enc y la clave de descifrado.");
    }
  });

  it('passes', () => {
    cy.visit(Cypress.config('baseUrl'));

    // Espera explícita antes de interactuar con los campos de login
    cy.wait(3000);  // Ajusta este tiempo si es necesario

    cy.get('#username', { timeout: 10000 }).should('be.visible').type(Cypress.env('USERNAME'));
    cy.get('#password', { timeout: 10000 }).should('be.visible').type(Cypress.env('PASSWORD'));
    cy.get('.bg-card').click();


    /* ==== End Cypress Studio ==== */
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.inline-flex').click();
    /* ==== End Cypress Studio ==== */
  });

  // For negative test
  it('fails', () => {
    cy.visit(Cypress.config('baseUrl'));
    
    // Espera explícita antes de interactuar con los campos de login
    cy.wait(3000);

    cy.get('#username').clear().type('incorrect_user');
    cy.get('#password').clear().type('incorrect_password');
    cy.get('.inline-flex').click();
  });
});
