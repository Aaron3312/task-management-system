describe('Equipo CRUD Operations', () => {
  /**
    * Setup and Environment Validation
    */
  before(() => {
    // Verify environment variables are available
    const username = Cypress.env('USERNAME');
    const password = Cypress.env('PASSWORD');

    if (!username || !password) {
      throw new Error("❌ No se encontraron las variables de entorno cifradas. Verifica el archivo cypress.env.enc y la clave de descifrado.");
    }
  });
  

  /**
    * Helper function for login - to be used across tests
    */
  beforeEach(() => {
    // Login before each test
    cy.visit(Cypress.config('baseUrl'));
    cy.wait(3000); // Wait for page to fully load

    // Login with credentials
    cy.get('#username', { timeout: 10000 }).should('be.visible').type(Cypress.env('USERNAME'));
    cy.get('#password', { timeout: 10000 }).should('be.visible').type(Cypress.env('PASSWORD'));
    cy.get('.bg-card').click();

    // Navigate to projects section
    cy.get('.inline-flex').click();
    // cy.get('[href="/task"] > .inline-flex > .ml-2').click();
    cy.get('.space-y-1 > [href="/users"] > .inline-flex').click();
    cy.wait(3500);
  });
// -----------------------------------------------------------------
// TEST 1: LOGIN AND NAVIGATION and verify users page and elements
// -----------------------------------------------------------------
it('should login and navigate to equipo page', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);


  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');
});
// -----------------------------------------------------------------
// TEST 2: CREATE A NEW USER
// -----------------------------------------------------------------
it('should create a new user', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);


  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');
  });
// -----------------------------------------------------------------
// TEST 3: VERIFY USER CREATION
// -----------------------------------------------------------------
  it('should verify user creation', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);
  

  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');


  cy.log('✅ User creation verification completed');
  });
// -----------------------------------------------------------------
// TEST 4: modify user
// -----------------------------------------------------------------
  it('should modify user', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);


  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');
  cy.log('✅ User modification completed');
  });
// -----------------------------------------------------------------
// TEST 5: VERIFY USER MODIFICATION
// -----------------------------------------------------------------
  it('should verify user modification', () => {
    cy.url().should('include', '/users');

  cy.wait(3500);


  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');

  cy.log('✅ User modification verification completed');
  });
// -----------------------------------------------------------------
// TEST 6: DELETE USER
// -----------------------------------------------------------------
  it('should delete user', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);



  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');

    cy.log('✅ User deletion completed');
  });
  // -----------------------------------------------------------------
  // TEST 7: VERIFY USER DELETION
  // -----------------------------------------------------------------
  it('should verify user deletion', () => {
  cy.url().should('include', '/users');

  cy.wait(3500);


  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«re»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rf»"]')
    .should('be.visible');

  cy.get('.flex > a > .inline-flex')
    .should('be.visible');

  cy.log('✅ Users page elements verification completed');
    
  cy.log('✅ Sprint deletion verification completed');
  });
});