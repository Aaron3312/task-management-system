  describe('task CRUD Operations', () => {
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
    cy.get('.space-y-1 > [href="/tasks"] > .inline-flex').click();
    cy.wait(5000);
  });

  
  // -----------------------------------------------------------------
  // TEST 1: LOGIN AND NAVIGATION and verify task page and elements
  // -----------------------------------------------------------------

  it('should login and navigate to task page', () => {
    // Verify task page is loaded
    cy.url().should('include', '/task');

    // Verify task page header element
    cy.get(':nth-child(1) > .\\@container\\/card-header > .jsx-9c6bc9effb1bcf1b > .text-lg', { timeout: 10000 })
      .should('be.visible');

    // Verify search input field
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .should('be.enabled');

    // Verify dropdown/filter control
    cy.get('[aria-controls="radix-«re»"]', { timeout: 10000 })
      .should('be.visible');

    // Verify action button
    cy.get('a.inline-flex > .inline-flex', { timeout: 10000 })
      .should('be.visible');

    // Verify task card/container
    cy.get(':nth-child(1) > .bg-gradient-to-br', { timeout: 10000 })
      .should('be.visible');

    cy.log('✅ All task page elements verified successfully');
  });
  // -----------------------------------------------------------------
  // TEST 2: CREATE A NEW TASK
  // -----------------------------------------------------------------
  it('should create a new task', () => {
     // Verify task page is loaded
    cy.url().should('include', '/task');

    cy.get('a.inline-flex > .inline-flex').should('be.visible').click();
    cy.wait(2000); // Wait for the modal to open




    cy.get('#title', { timeout: 15000 }).should('be.visible').clear();
    cy.get('#title').type('tarea Prueba', { delay: 50 });
    cy.get('#description').click();
    cy.get('#description').type('tarea Prueba', { delay: 50 });

    // Click on first dropdown (fixed selector - removed extra 't')
    cy.get('.md\\:grid-cols-2 > :nth-child(1) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // Click on second dropdown
    cy.get('.md\\:grid-cols-2 > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(5) // Use eq(0) to select the first dropdown
      .should('be.visible')
      .click({ force: true });

    // Click on third dropdown (grid-cols-3 first child)
    cy.get('.md\\:grid-cols-3 > :nth-child(1) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select sixth option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(2)
      .click({ force: true });

    // Click on fourth dropdown (grid-cols-3 second child)
    cy.get('.md\\:grid-cols-3 > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(1) // Use eq(0) to select the first dropdown
      .should('be.visible')
      .click({ force: true });

    // Fill estimated hours
    cy.get('#estimated_hours', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('8');

    // Click on date picker
    cy.get('.space-y-4 > :nth-child(6) > .inline-flex')
      .should('have.length.greaterThan', 0)
      .first()
      .click({ force: true });

    // Wait for date picker to open and select a date
    cy.wait(1000);

    // Select today's date or first available date using the specific calendar element
    cy.get(':nth-child(1) > :nth-child(4) > .rdp-button_reset')
      .should('have.length.greaterThan', 0)
      .first()
      .click({ force: true });

    // Save new task - fixed selector for single element
    cy.get('.bg-primary', { timeout: 7500 })
      .should('be.visible')
      .first()
      .click({ force: true });
    cy.wait(3500); // Wait for the task to be created
  });
  // -----------------------------------------------------------------
  // TEST 3: VERIFY TASK CREATION
  // -----------------------------------------------------------------
  it('should verify the newly created task', () => {
    // Verify task page is loaded
    cy.url().should('include', '/task');

    // Search for the newly created task
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .type('tarea Prueba');

    // Wait for search results to load
    cy.wait(3000);

    // Verify the task appears in the list
    cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
      .contains('tarea Prueba')
      .should('be.visible');
    cy.log('✅ Task creation verified successfully');
  });
  // -----------------------------------------------------------------
  // TEST 4: Modify the created task
  // -----------------------------------------------------------------
  it('should verify the newly created task', () => {
    // Verify task page is loaded
    cy.url().should('include', '/task');

    // Search for the newly created task
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .type('tarea Prueba');

    // Wait for search results to load
    cy.wait(3000);

    // Verify the task appears in the list
    cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
      .contains('tarea Prueba')
      .should('be.visible')
      .click();

    cy.get('.space-x-2 > a > .inline-flex')
      .should('be.visible')
      .click();
    cy.wait(2000); // Wait for the modal to open

    cy.get('#title', { timeout: 15000 }).should('be.visible').clear();
    cy.get('#title').type('tarea Prueba_cambiada', { delay: 50 });
    cy.get('#description').click();
    cy.get('#description').type('tarea Prueba_cambiada', { delay: 50 });

    // Click on first dropdown (fixed selector - removed extra 't')
    cy.get('.md\\:grid-cols-2 > :nth-child(1) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(0) // Use eq(0) to select the first dropdown
      .should('be.visible')
      .click({ force: true });

    // Click on second dropdown
    cy.get('.md\\:grid-cols-2 > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(5) // Use eq(0) to select the first dropdown
      .should('be.visible')
      .click({ force: true });

    // Click on third dropdown (grid-cols-3 first child)
    cy.get('.md\\:grid-cols-3 > :nth-child(1) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select sixth option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(1)
      .click({ force: true });

    // Click on fourth dropdown (grid-cols-3 second child)
    cy.get('.md\\:grid-cols-3 > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(2) // Use eq(0) to select the first dropdown
      .should('be.visible')
      .click({ force: true });

    // Fill estimated hours
    cy.get('#estimated_hours', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('8');

    // Click on date picker
    cy.get('.space-y-4 > :nth-child(6) > .inline-flex')
      .should('have.length.greaterThan', 0)
      .first()
      .click({ force: true });

    // Wait for date picker to open and select a date
    cy.wait(1000);

    // Select today's date or first available date using the specific calendar element
    cy.get(':nth-child(1) > :nth-child(4) > .rdp-button_reset')
      .should('have.length.greaterThan', 0)
      .first()
      .click({ force: true });

    // Save new task - fixed selector for single element
    cy.get('.bg-primary', { timeout: 7500 })
      .should('be.visible')
      .first()
      .click({ force: true });
    cy.wait(3500); // Wait for the task to be created
  });
  // -----------------------------------------------------------------
  // TEST 5: VERIFY TASK MODIFICATION 
  // -----------------------------------------------------------------
  it('should verify the modified task', () => {
    // Verify task page is loaded
    cy.url().should('include', '/tasks');

    // Search for the modified task
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .type('tarea Prueba_cambiada');

    // Wait for search results to load
    cy.wait(3000);

    // Verify the task appears in the list
    cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
      .contains('tarea Prueba_cambiada')
      .should('be.visible');
    
    cy.log('✅ Task modification verified successfully');
  });
  //  -----------------------------------------------------------------
  // TEST 6: Asignar user to the modified task
  // -----------------------------------------------------------------

  it('should assign a user to the modified task', () => {
    // Verify task page is loaded
    cy.url().should('include', '/tasks');

    // Search for the modified task
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .type('tarea Prueba_cambiada');

    // Wait for search results to load
    cy.wait(3000);

    // Click on the modified task
    cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
      .contains('tarea Prueba_cambiada')
      .should('be.visible')
      .click();

    cy.wait(2000); // Wait for the task details to load

    // cy.get('.\@container\/card-header > .inline-flex')
    cy.contains('button', 'Asignar usuario').click();


    cy.get('#user')
      .should('be.visible')
      .first()
      .click({ force: true });

    cy.wait(1000); // Wait for the dropdown to open
      
    cy.get('[role="option"]', { timeout: 5000 })
      .eq(4) // Select the first option from the dropdown
      .should('be.visible')
      .click({ force: true });

    cy.wait(2000);

    cy.realPress(['Tab']);
    cy.wait(1000);
    cy.realPress(['Tab']);
    cy.wait(1000);
    cy.realPress(['Enter']);
    cy.wait(2000);
  });
     // -----------------------------------------------------------------
  // TEST 7: Asignar user to the modified task
  // -----------------------------------------------------------------
  it('should add a subtask in task', () => {
    // Verify task page is loaded
    cy.url().should('include', '/tasks');

    // Search for the modified task
    cy.get('.file\\:text-foreground', { timeout: 10000 })
      .should('be.visible')
      .type('tarea Prueba_cambiada');

    // Wait for search results to load
    cy.wait(3000);

    // Click on the modified task
    cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
      .contains('tarea Prueba_cambiada')
      .should('be.visible')
      .click();

    cy.wait(2000); // Wait for the task details to load

    cy.get('.border-input')
      .should('be.visible')
      .type('Agregando prueba de comentario ')
    cy.wait(1000)

    cy.get('.mt-4 > .inline-flex')
      .should('be.visible')
      .click();
    });

    // cy.get('.\@container\/card-header > .inline-flex')
  // // -----------------------------------------------------------------
  // // TEST 8: DELETE THE MODIFIED TASK
  // // -----------------------------------------------------------------
  // it('should delete the modified task', () => {
  //   // Verify task page is loaded
  //   cy.url().should('include', '/tasks');

  //   // Search for the modified task
  //   cy.get('.file\\:text-foreground', { timeout: 10000 })
  //     .should('be.visible')
  //     .type('tarea Prueba_cambiada')

  //     cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
  //     .contains('tarea Prueba_cambiada')
  //     .should('be.visible')
  //     .click();

  //     cy.wait(2000); // Wait for the task details to load

  //     cy.get('.bg-destructive')
  //     .should('be.visible')
  //     .click();
  // });
  // // -----------------------------------------------------------------
  // // TEST 9: VERIFY TASK DELETION
  // // -----------------------------------------------------------------
  // it('should verify the task deletion', () => {
  //   // Verify task page is loaded
  //   cy.url().should('include', '/tasks');

  //   // Search for the deleted task
  //   cy.get('.file\\:text-foreground', { timeout: 10000 })
  //     .should('be.visible')
  //     .type('tarea Prueba_cambiada');

  //   // Wait for search results to load
  //   cy.wait(3000);

  //   // Verify the task does not appear in the list
  //   cy.get('.jsx-9c6bc9effb1bcf1b > .text-lg')
  //     .contains('tarea Prueba_cambiada')
  //     .should('not.exist');
  // // Verify the sprint is not visible after deletion
  // cy.get('body').then(($body) => {
  //   if ($body.text().includes('tarea Prueba_cambiada')) {
  //     cy.log('❌ Sprint still found - deletion may have failed');
  //     cy.get('body').should('not.contain.text', 'tarea Prueba_cambiada');
  //   } else {
  //     cy.log('✅ Sprint successfully deleted - not found in search results');
      
  //     // Verify empty state or no results message
  //     const noResultsMessages = [
  //       'No se encontraron tareas',
  //       'Sin resultados',
  //       'No tareas found',
  //       'No hay sprints',
  //       'empty'
  //     ];
      
  //     let emptyStateFound = false;
  //     noResultsMessages.forEach((message) => {
  //       if ($body.text().includes(message)) {
  //         cy.log(`✅ Empty state confirmed: ${message}`);
  //         emptyStateFound = true;
  //       }
  //     });
      
  //     if (!emptyStateFound) {
  //       cy.log('✅ Sprint not found in search results - deletion confirmed');
  //     }
  //   }
  // });
  
  // // Clear search to verify sprint is completely gone
  // cy.get('.file\\:text-foreground').clear();
  // cy.wait(1000);
  
  // // Verify sprint doesn't appear in full list either
  // cy.get('body').should('not.contain.text', 'tarea Prueba_cambiada');
  
  // cy.log('✅ Sprint deletion verification completed');
  // });
});