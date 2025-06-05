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

  cy.wait(18000);

  cy.get(':nth-child(1) > .bg-gradient-to-br')
    .should('be.visible');

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

  cy.wait(18000);

  cy.get('.flex > a > .inline-flex')
    .should('be.visible')
    .click();
  
  // Wait for navigation to complete with increased timeout
  cy.url({ timeout: 10000 }).should('include', '/users/new');
  
  cy.wait(3000); // Additional wait for page to fully load
  
  cy.get('#fullName', { timeout: 10000 })
    .should('be.visible')
    .type('Test User');

  cy.get('#email', { timeout: 10000 })
    .should('be.visible')
    .type('test_user@oracle.com');
  
  cy.get('#username', { timeout: 10000 })
    .should('be.visible')
    .type('test_user');

  cy.get(':nth-child(2) > :nth-child(2) > .border-input', { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });

  // Select third option from dropdown
  cy.get('[role="option"]', { timeout: 5000 })
    .eq(2)
    .should('be.visible')
    .click({ force: true });

  cy.wait(1000); // Wait between dropdown selections

  cy.get(':nth-child(3) > .border-input', { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });

  // Select first option from dropdown
  cy.get('[role="option"]', { timeout: 5000 })
    .eq(0)
    .should('be.visible')
    .click({ force: true });

  cy.wait(1000); // Wait before submitting

  cy.get('.bg-primary', { timeout: 10000 })
    .should('be.visible')
    .click();

  cy.wait(3000); // Wait for user creation to complete

  cy.log('✅ User creation completed');
  });
// -----------------------------------------------------------------
// TEST 3: VERIFY USER CREATION
// -----------------------------------------------------------------
  it('should verify user creation', () => {
    cy.url().should('include', '/users');

    cy.wait(18000);

    // Search for the newly created user
    cy.get('.file\\:text-foreground')
      .should('be.visible')
      .type('test_user');

    cy.wait(18000); // Wait for search results to update

    // Verify the user appears in the list
    cy.get('.flex-1 > .text-lg')
      .contains('Test User')
      .should('be.visible');

    cy.log('✅ User creation verification completed');
  });
// -----------------------------------------------------------------
// TEST 4: modify user
// -----------------------------------------------------------------
  it('should modify user', () => {
    cy.url().should('include', '/users');

    cy.wait(18000);

    // Search for the user to modify
    cy.get('.file\\:text-foreground')
      .should('be.visible')
      .type('test_user');

    cy.wait(3000); // Wait for search results to update

    // Click on the user to edit
    cy.get('.flex-1 > .text-lg')
      .contains('Test User')
      .click();

    cy.wait(3000); // Wait for user details page to load

    cy.get('.space-x-2 > a > .inline-flex')
      .should('be.visible')
      .click();
    cy.wait(18000); // Wait for edit page to load

    // Modify user details
    cy.get('#fullName', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Modified User');

    cy.get('#email', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('modify@user.com');
    cy.get('#username', { timeout: 10000 })
      .should('be.visible') 
      .clear()
      .type('modify_user');

    cy.get(':nth-child(2) > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    // Select third option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(3)
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000); // Wait between dropdown selections
    cy.get(':nth-child(3) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(2)
      .should('be.visible')
      .click({ force: true });
    cy.wait(1000); // Wait before submitting
    cy.get('.bg-primary', { timeout: 10000 })
      .should('be.visible')
      .click();
    cy.wait(3000); // Wait for user modification to complete
    cy.log('✅ User modification completed');
  });
// -----------------------------------------------------------------
// TEST 5: VERIFY USER MODIFICATION
// -----------------------------------------------------------------
  it('should verify user modification', () => {
    cy.url().should('include', '/users');

    cy.wait(18000);

    // Search for the modified user
    cy.get('.file\\:text-foreground')
      .should('be.visible')
      .type('modify_user');

    cy.wait(18000); // Wait for search results to update

    // Verify the modified user appears in the list
    cy.get('.flex-1 > .text-lg')
      .contains('Modified User')
      .should('be.visible');

    cy.log('✅ User modification verification completed');
  });
// -----------------------------------------------------------------
// TEST 6: DELETE USER
// -----------------------------------------------------------------
  it('should delete user', () => {
    cy.url().should('include', '/users');

    cy.wait(18000);

    // Search for the user to delete
    cy.get('.file\\:text-foreground')
      .should('be.visible')
      .type('modify_user');

    cy.wait(3000); // Wait for search results to update

    // Click on the user to delete
    cy.get('.flex-1 > .text-lg')
      .contains('Modified User')
      .click();

    cy.wait(18000); // Wait for user details page to load

    // Click on delete button
    cy.get('.bg-destructive')
      .should('be.visible')
      .click();

    cy.realPress(['Tab']);
    cy.wait(1000);

    cy.realPress(['Enter']);
    cy.wait(3000); // Wait for user deletion to complete

    cy.log('✅ User deletion completed');
  });
  // // -----------------------------------------------------------------
  // // TEST 7: VERIFY USER DELETION
  // // -----------------------------------------------------------------
  // it('should verify user deletion', () => {
  //   cy.url().should('include', '/users');

  //   cy.wait(5000);

  //   // Search for the deleted user
  //   cy.get('.file\\:text-foreground')
  //     .should('be.visible')
  //     .type('modify_user');

  //   cy.wait(3000); // Wait for search results to update
  //   cy.get('body').then(($body) => {
  //     if ($body.text().includes('cambio_Prueba_sprint')) {
  //       cy.log('❌ Sprint still found - deletion may have failed');
  //       cy.get('body').should('not.contain.text', 'modify_user');
  //     } else {
  //       cy.log('✅ Sprint successfully deleted - not found in search results');
        
  //       // Verify empty state or no results message
  //       const noResultsMessages = [
  //         'No se encontraron usuarios',
  //         'Sin resultados',
  //         'No user found',
  //         'No hay sprints',
  //         'empty'
  //       ];
        
  //       let emptyStateFound = false;
  //       noResultsMessages.forEach((message) => {
  //         if ($body.text().includes(message)) {
  //           cy.log(`✅ Empty state confirmed: ${message}`);
  //           emptyStateFound = true;
  //         }
  //       });
        
  //       if (!emptyStateFound) {
  //         cy.log('✅ Sprint not found in search results - deletion confirmed');
  //       }
  //     }
  //   });
    
  //   // Clear search to verify sprint is completely gone
  //   cy.get('.file\\:text-foreground').clear();
  //   cy.wait(1000);
    
  //   // Verify sprint doesn't appear in full list either
  //   cy.get('body').should('not.contain.text', 'modify_user');
    
  //   cy.log('✅ Sprint deletion verification completed');
  //   });
});