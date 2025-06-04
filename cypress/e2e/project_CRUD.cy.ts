describe('Project Management CRUD Operations', () => {
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
    cy.get('[href="/projects"] > .inline-flex > .ml-2').click();
    cy.wait(3500);
  });

  // -----------------------------------------------------------------
  // TEST 1: LOGIN AND NAVIGATION
  // -----------------------------------------------------------------
  it('should login successfully and navigate to projects section', () => {
    // Verify we're on the projects page
    cy.url().should('include', '/projects');
    
    // Verify projects page elements are visible
    cy.get('.flex > a > .inline-flex').should('be.visible'); // Create project button should be visible
  });

  // -----------------------------------------------------------------
  // TEST 2: CREATE NEW PROJECT
  // -----------------------------------------------------------------
  it('should create a new project with all required fields', () => {
    // Click on create new project button
    cy.get('.flex > a > .inline-flex').click({ force: true });
    
    // Fill project details
    cy.get('#name', { timeout: 15000 }).should('be.visible').clear();
    cy.get('#name').type('Prueba_Proyecto');
    cy.get('#description').click();
    cy.get('#description').type('Descripción del proyecto de prueba');
    
    // SELECT PROJECT DATES
    cy.get('#start_date', { timeout: 10000 })
      .should('be.visible')
      .type('2025-03-01');
    
    cy.get('#end_date', { timeout: 10000 })
      .should('be.visible')
      .type('2025-03-31');
    
    // BLUR the date inputs before handling modals
    cy.get('#end_date').blur(); // Remove focus from date input
    
    // Handle dropdown selection
    cy.wait(2000); // Wait for any previous modal to close

    // Check if body has scroll locked and close any modal
    cy.get('body').then(($body) => {
      if ($body.attr('data-scroll-locked') === '1') {
        // Use document.dispatchEvent instead of cy.type for ESC key
        cy.document().then((doc) => {
          const escapeEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true
          });
          doc.dispatchEvent(escapeEvent);
        });
        cy.wait(500);
      }
    });

    // Click on dropdown
    cy.get(':nth-child(4) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .first()
      .should('be.visible')
      .click({ force: true });
    
    // Save new project
    cy.get('.bg-primary', { timeout: 7500 }).click();
    cy.get('.mr-4 > .inline-flex').click();
    cy.wait(2000); // Wait for the project to be created
  });

  // -----------------------------------------------------------------
  // TEST 3: SEARCH FOR PROJECT
  // -----------------------------------------------------------------
  it('should search for an existing project', () => {
    // Skip search functionality for now if selector is problematic
    // cy.get('input[type="text"]:visible').first().clear().type('Prueba');
    
    // Wait for projects to load and verify the test project appears
    cy.wait(3500);
    // Search for the specific project in the search input
    cy.get('.file\\:text-foreground')
      .type('Prueba_Proyecto');
    // Wait for search results
    cy.wait(1000);
  });

  // -----------------------------------------------------------------
  // TEST 4: VIEW PROJECT DETAILS
  // -----------------------------------------------------------------
  it('should open project details view', () => {
    // Wait for projects to load
    cy.wait(3500);
    // Search for the specific project in the search input
    cy.get('.file\\:text-foreground')
      .type('Prueba_Proyecto');
    
    // Wait for search results
    cy.wait(1000);
    
    // Find the first "Ver proyecto" button and click it
    cy.contains('button', 'Ver proyecto')
      .first()
      .should('be.visible')
    .click();
    // Verify we're now on the project details page
    cy.wait(3500);
    cy.url().should('include', '/project'); // Adjust based on your actual URL pattern
  });

// TEST 5: UPDATE PROJECT DETAILS
// -----------------------------------------------------------------
it('should update project information', () => {
  // First navigate to project details
  cy.wait(3500);
  
  // Search for the specific project in the search input
  cy.get('.file\\:text-foreground')
    .clear()
    .type('Prueba_Proyecto');
  
  // Wait for search results
  cy.wait(1000);
  
  // Find the first "Ver proyecto" button and click it
  cy.contains('button', 'Ver proyecto')
    .first()
    .should('be.visible')
    .click();
  
  cy.wait(3500);

  // Click on edit project button
  cy.get('.space-x-2 > .focus-visible\\:ring-ring\\/50', { timeout: 15000 })
    .should('be.visible')
    .click();
  
  // Update project information
  cy.get('#name').should('exist').clear();
  cy.get('#name').should('exist').type('Proyecto_Actualizado');
  cy.get('#description').click();
  cy.get('#description').clear();
  cy.get('#description').type('Descripción actualizada del proyecto');
  
  // Update dates
  cy.get('#start_date').should('be.visible').type('2025-09-15');
  cy.get('#end_date').should('be.visible').type('2025-10-15');
  
  // BLUR the date inputs before handling dropdown
  cy.get('#end_date').blur();

  // Handle dropdown selection
  cy.wait(2000); // Wait for any previous modal to close

  
  // Handle the Select component for status - Based on the ProjectForm component
  cy.get('[role="combobox"]', { timeout: 10000 })
    .should('be.visible')
    .click({ force: true });
  
  // Wait for the dropdown options to appear
  cy.wait(500);
  
  // Select "Activo" (value="1") from the dropdown
  cy.get('[role="option"]')
    .contains('Activo')
    .should('be.visible')
    .click({ force: true });
  
  // Save updated project
  cy.contains('button', 'Actualizar proyecto')
    .should('be.visible')
    .click();

  // Verify the update was successful
  cy.wait(2000);
  
  // Verify that we're back on the project list or detail page
  cy.url().should('not.include', '/edit');
  
  // Optionally verify the updated name appears
  cy.contains('Proyecto_Actualizado').should('be.visible');
});
  // -----------------------------------------------------------------
  // TEST 6: DELETE PROJECT
  // -----------------------------------------------------------------
  it('should delete a project', () => {
    // First navigate to project details
    cy.wait(3500);
    
    // Search for the specific project in the search input
    cy.get('.file\\:text-foreground')
      .type('Proyecto_Actualizado');
    
    // Wait for search results
    cy.wait(1000);
    
    // Find the first "Ver proyecto" button and click it
    cy.contains('button', 'Ver proyecto')
      .first()
      .should('be.visible')
    .click();

    cy.wait(3500);

    // Click delete button and confirm deletion
    cy.get('.bg-destructive', { timeout: 10000 })
      .should('exist')
      .click();
    
    cy.get('.flex-col-reverse > .text-primary-foreground')
      .should('exist')
      .click();

    // Verify deletion was successful (should redirect to projects list)
    cy.wait(2000);
    cy.url().should('include', '/projects');
    
    // Verify the project is no longer in the list (optional)
    // cy.contains('div[data-slot="card-title"].text-lg.font-medium', 'Proyecto_Actualizado')
    //   .should('not.exist');
  });

  // -----------------------------------------------------------------
  // TEST 7: VERIFY PROJECT NO LONGER EXISTS (CLEANUP VERIFICATION)
  // -----------------------------------------------------------------
  it('should verify deleted project no longer appears in the list', () => {
  cy.wait(3500);
  
  // Search for the deleted project in the search input
  cy.get('.file\\:text-foreground')
    .clear()
    .type('Proyecto_Actualizado');
  
  // Wait for search results
  cy.wait(2000);
  
  // Verify that no "Ver proyecto" button appears (project should not exist)
  cy.contains('Proyecto_Actualizado').should('not.exist');
  });
});

