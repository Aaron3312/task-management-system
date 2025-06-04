describe('Sprint CRUD Operations', () => {
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
    cy.get('[href="/sprints"] > .inline-flex > .ml-2').click();
    cy.wait(3500);
  });


  // -----------------------------------------------------------------
  // // TEST 1: LOGIN AND NAVIGATION and verify sprints page and elements
  // // -----------------------------------------------------------------
  // it('should login successfully and navigate to sprints section', () => {
  //   // Verify we're on the sprints page
  //   cy.url().should('include', '/sprints');
    
  //   cy.log('✅ Successfully navigated to sprints page');
    
  //   // Verify page title "Sprints" is visible
  //   cy.get('body').then(($body) => {
  //     if ($body.find('.text-2xl.font-bold').length > 0) {
  //       cy.log('✅ Page title found using .text-2xl.font-bold');
  //       cy.get('.text-2xl.font-bold').should('be.visible');
  //       cy.get('.text-2xl.font-bold').should('contain.text', 'Sprints');
  //     } else if ($body.text().includes('Sprints')) {
  //       cy.log('✅ Page title found by text content');
  //       cy.contains('Sprints').should('be.visible');
  //     } else {
  //       cy.log('ℹ️ Page title not found - checking for alternative headers');
  //       // Check for any h1 or large text that might be the title
  //       const titleSelectors = ['h1', '.text-xl', '.text-3xl', '[class*="font-bold"]'];
  //       titleSelectors.forEach((selector) => {
  //         if ($body.find(selector).length > 0) {
  //           cy.log(`ℹ️ Alternative title selector found: ${selector}`);
  //         }
  //       });
  //     }
  //   });
    
  //   // Verify search bar is visible and functional
  //   cy.get('body').then(($body) => {
  //     // Check for search input using different selectors
  //     if ($body.find('.file\\:text-foreground').length > 0) {
  //       cy.log('✅ Search bar found using .file:text-foreground');
  //       cy.get('.file\\:text-foreground').should('be.visible');
  //       cy.get('.file\\:text-foreground').should('have.attr', 'placeholder', 'Buscar sprints...');
  //     } else if ($body.find('input[placeholder*="Buscar"]').length > 0) {
  //       cy.log('✅ Search bar found by placeholder text');
  //       cy.get('input[placeholder*="Buscar"]').should('be.visible');
  //     } else if ($body.find('[data-slot="input"]').length > 0) {
  //       cy.log('✅ Search bar found using data-slot attribute');
  //       cy.get('[data-slot="input"]').should('be.visible');
  //     } else {
  //       cy.log('ℹ️ Search bar not found - checking for alternative input elements');
  //       const inputSelectors = ['input[type="text"]', 'input[type="search"]', '.search-input', '[class*="search"]'];
  //       inputSelectors.forEach((selector) => {
  //         if ($body.find(selector).length > 0) {
  //           cy.log(`ℹ️ Alternative search input found: ${selector}`);
  //           cy.get(selector).first().should('be.visible');
  //         }
  //       });
  //     }
  //   });
    
  //   // Verify filter dropdowns are present
  //   cy.get('body').then(($body) => {
  //     // Check for "Todos los proyectos" dropdown
  //     if ($body.text().includes('Todos los proyectos')) {
  //       cy.log('✅ Projects filter dropdown found');
  //       cy.contains('Todos los proyectos').should('be.visible');
  //     }
      
  //     // Check for "Todos los estados" dropdown
  //     if ($body.text().includes('Todos los estados')) {
  //       cy.log('✅ Status filter dropdown found');
  //       cy.contains('Todos los estados').should('be.visible');
  //     }
      
  //     // Check for dropdown buttons using data attributes
  //     const dropdownSelectors = [
  //       '[role="combobox"]',
  //       '[data-slot="select-trigger"]',
  //       '[aria-controls*="radix"]'
  //     ];
      
  //     dropdownSelectors.forEach((selector) => {
  //       if ($body.find(selector).length > 0) {
  //         cy.log(`✅ Dropdown elements found using: ${selector}`);
  //         cy.get(selector).should('have.length.greaterThan', 0);
  //       }
  //     });
  //   });
    
  //   // Verify create sprint button is visible
  //   cy.get('body').then(($body) => {
  //     if ($body.find('.flex > a > .inline-flex').length > 0) {
  //       cy.log('✅ Create sprint button found using .flex > a > .inline-flex');
  //       cy.get('.flex > a > .inline-flex').should('be.visible');
  //     } else {
  //       // Look for alternative create button selectors
  //       const createButtonSelectors = [
  //         'a[href*="create"]',
  //         'button[class*="inline-flex"]',
  //         '[class*="create"]',
  //         'a.inline-flex',
  //         'button.inline-flex'
  //       ];
        
  //       let buttonFound = false;
  //       createButtonSelectors.forEach((selector) => {
  //         if ($body.find(selector).length > 0) {
  //           cy.log(`✅ Create button found using: ${selector}`);
  //           cy.get(selector).first().should('be.visible');
  //           buttonFound = true;
  //         }
  //       });
        
  //       if (!buttonFound) {
  //         // Check for any button or link that might be for creating sprints
  //         if ($body.text().includes('Crear') || $body.text().includes('Nuevo') || $body.text().includes('Create')) {
  //           cy.log('ℹ️ Create button found by text content');
  //           const createTexts = ['Crear', 'Nuevo', 'Create', '+'];
  //           createTexts.forEach((text) => {
  //             if ($body.text().includes(text)) {
  //               cy.contains(text).should('be.visible');
  //             }
  //           });
  //         } else {
  //           cy.log('ℹ️ Create sprint button not found - checking page functionality');
  //         }
  //       }
  //     }
  //   });
    
  //   // Verify sprint cards/content area
  //   cy.get('body').then(($body) => {
  //     // Check for sprint cards
  //     if ($body.find(':nth-child(1) > .bg-gradient-to-br').length > 0) {
  //       cy.log('✅ Sprint cards found');
  //       cy.get(':nth-child(1) > .bg-gradient-to-br').should('be.visible');
  //     } else {
  //       // Look for alternative sprint card selectors
  //       const cardSelectors = [
  //         '.bg-gradient-to-br',
  //         '[class*="bg-gradient"]',
  //         '.card',
  //         '[class*="card"]',
  //         '.grid > div',
  //         '.sprint-item',
  //         '[data-sprint-id]'
  //       ];
        
  //       let cardsFound = false;
  //       cardSelectors.forEach((selector) => {
  //         if ($body.find(selector).length > 0) {
  //           cy.log(`✅ Sprint content found using: ${selector}`);
  //           cy.get(selector).should('have.length.greaterThan', 0);
  //           cardsFound = true;
  //         }
  //       });
        
  //       if (!cardsFound) {
  //         // Check for empty state
  //         const emptyStateTexts = [
  //           'No hay sprints',
  //           'Sin sprints',
  //           'No sprints found',
  //           'empty',
  //           'vacío'
  //         ];
          
  //         let emptyStateFound = false;
  //         emptyStateTexts.forEach((text) => {
  //           if ($body.text().includes(text)) {
  //             cy.log(`ℹ️ Empty state detected: ${text}`);
  //             emptyStateFound = true;
  //           }
  //         });
          
  //         if (!emptyStateFound) {
  //           cy.log('ℹ️ No sprint cards or empty state found - checking general content');
  //           // Verify basic page structure exists
  //           cy.get('.w-full').should('exist');
  //         }
  //       }
  //     }
  //   });
    
  //   // Verify main page elements are functional
  //   cy.log('🔍 Verifying page functionality');
    
  //   // Test search bar functionality if found
  //   cy.get('body').then(($body) => {
  //     const searchSelectors = [
  //       '.file\\:text-foreground',
  //       'input[placeholder*="Buscar"]',
  //       '[data-slot="input"]'
  //     ];
      
  //     searchSelectors.forEach((selector) => {
  //       if ($body.find(selector).length > 0) {
  //         cy.get(selector).should('be.enabled');
  //         cy.get(selector).clear().type('test{enter}');
  //         cy.wait(1000);
  //         cy.get(selector).clear();
  //         cy.log('✅ Search functionality verified');
  //       }
  //     });
  //   });
    
  //   // Verify page layout and responsiveness
  //   cy.get('.w-full').should('be.visible');
  //   cy.get('body').should('have.css', 'margin').and('not.equal', '');
    
  //   cy.log('✅ Sprints page elements verification completed');
  // });
  // -----------------------------------------------------------------
  // TEST 2: CREATE A NEW SPRINT
  // -----------------------------------------------------------------
  // it('should create a new sprint', () => {
  //   cy.url().should('include', '/sprints');
  //   cy.get('.flex > a > .inline-flex').should('be.visible').click();
  //   cy.wait(2000); // Wait for the create sprint page to load

  //   cy.url().should('include', '/sprints/new');
  //   // Fill project details
  //   cy.get('#name', { timeout: 15000 }).should('be.visible').clear();
  //   cy.get('#name').type('Prueba_sprint', { delay: 50 });
  //   cy.get('#description').click();
  //   cy.get('#description').type('Descripción del proyecto de sprint', { delay: 50 });

  //   // Click on dropdown
  //   cy.get(':nth-child(3) > .border-input', { timeout: 10000 })
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Select first option from dropdown
  //   cy.get('[role="option"]', { timeout: 5000 })
  //     .first()
  //     .should('be.visible')
  //     .click({ force: true });
  //   /* ==== Generated with Cypress Studio ==== */
  //   cy.get('.grid > :nth-child(1) > .inline-flex').eq(0).click();
  //   cy.get(':nth-child(1) > :nth-child(3)').eq(0).click({ force: true });
  //   cy.wait(500);
  //   cy.get('.grid > :nth-child(2) > .inline-flex').eq(0).click();
  //   cy.get(':nth-child(2) > :nth-child(6)').eq(0).click({ force: true });

  //   // Click on dropdown
  //   cy.get(':nth-child(5) > .border-input', { timeout: 10000 })
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Select first option from dropdown
  //   cy.get('[role="option"]', { timeout: 5000 })
  //     .first()
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Save new project
  //   cy.get('.bg-primary', { timeout: 7500 }).click();
  //   cy.wait(3500); // Wait for the project to be created
  // });
  // -----------------------------------------------------------------
  // TEST 3: VERIFY CREATED SPRINT
  // -----------------------------------------------------------------
  // it('should verify the created sprint is visible in the list', () => {
  //   cy.url().should('include', '/sprints');
  //   cy.get('.file\\:text-foreground')
  //     .should('be.visible')
  //     .type('Prueba_sprint');
  //   cy.get('.jsx-a6e1b883d4d5e818 > .text-lg')
  //     .should('be.visible')
  //     .contains('Prueba_sprint')
  //     .should('be.visible');
  // });
  // -----------------------------------------------------------------
  // TEST 4: should open sprint details view
  // -----------------------------------------------------------------
  // it('should open sprint details view', () => {
  //   cy.url().should('include', '/sprints');
  //   cy.get('.file\\:text-foreground')
  //     .should('be.visible')
  //     .type('Prueba_sprint');
  //   cy.get('.jsx-a6e1b883d4d5e818 > .text-lg')
  //     .should('be.visible')
  //     .contains('Prueba_sprint')
  //     .should('be.visible')
  //     .click();
  //   cy.wait(3500);
  // });
  // -----------------------------------------------------------------
  // TEST 5: Modify the sprint
  // -----------------------------------------------------------------

  // it('should modify the sprint', () => {
  //   cy.url().should('include', '/sprints');
  //   cy.get('.file\\:text-foreground')
  //     .should('be.visible')
  //     .type('Prueba_sprint');

  //   cy.get('.jsx-a6e1b883d4d5e818 > .text-lg')
  //     .should('be.visible')
  //     .contains('Prueba_sprint')
  //     .should('be.visible')
  //     .click();

  //   cy.wait(3500);

  //   cy.get('.space-x-2 > a > .inline-flex').should('be.visible').click();
  //   cy.wait(2000)

  //   cy.get('#name', { timeout: 15000 }).should('be.visible').clear();
  //   cy.get('#name').type('cambio_Prueba_sprint', { delay: 50 });
  //   cy.get('#description').click();
  //   cy.get('#description').type('Descripción del  cambio de proyecto de sprint', { delay: 50 });

  //   // Click on dropdown
  //   cy.get(':nth-child(3) > .border-input', { timeout: 10000 })
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Select first option from dropdown
  //   cy.get('[role="option"]', { timeout: 5000 })
  //     .first()
  //     .should('be.visible')
  //     .click({ force: true });
  //   /* ==== Generated with Cypress Studio ==== */
  //   cy.get('.grid > :nth-child(1) > .inline-flex').eq(0).click();
  //   cy.get(':nth-child(1) > :nth-child(3)').eq(0).click({ force: true });
  //   cy.wait(500);
  //   cy.get('.grid > :nth-child(2) > .inline-flex').eq(0).click();
  //   cy.get(':nth-child(2) > :nth-child(6)').eq(0).click({ force: true });

  //   // Click on dropdown
  //   cy.get(':nth-child(5) > .border-input', { timeout: 10000 })
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Select first option from dropdown
  //   cy.get('[role="option"]', { timeout: 5000 })
  //     .first()
  //     .should('be.visible')
  //     .click({ force: true });

  //   // Save new project
  //   cy.get('.bg-primary', { timeout: 7500 }).click();
  //   cy.wait(3500); // Wait for the project to be created
  // });

  // -----------------------------------------------------------------
  // TEST 5: Verify if the sprint was Modify sprint
  // -----------------------------------------------------------------

  // it('should modify the sprint', () => {
  //   cy.url().should('include', '/sprints');
  //   cy.get('.file\\:text-foreground')
  //     .should('be.visible')
  //     .type('cambio_Prueba_sprint');
  //   cy.wait(500)
    
  //   cy.get('.jsx-a6e1b883d4d5e818 > .text-lg')
  //     .should('be.visible')
  //     .contains('cambio_Prueba_sprint')
  //     .should('be.visible')
  // });
// -----------------------------------------------------------------
// TEST 6: Add a new task to the sprint
// -----------------------------------------------------------------
it('should modify the sprint', () => {
  cy.url().should('include', '/sprints');
  cy.get('.file\\:text-foreground')
    .should('be.visible')
    .type('cambio_Prueba_sprint');
  cy.wait(500)
  
  cy.get('.jsx-a6e1b883d4d5e818 > .text-lg')
    .should('be.visible')
    .contains('cambio_Prueba_sprint')
    .should('be.visible')
    .click();
    cy.wait(3500)

    cy.get('.justify-between > a > .inline-flex')
    .should('be.visible')
    .click()

    cy.get('#title', { timeout: 15000 }).should('be.visible').clear();
    cy.get('#title').type('tarea desde sprint', { delay: 50 });
    cy.get('#description').click();
    cy.get('#description').type('Descripción de creacion de tarea desde sprint', { delay: 50 });

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
      .first()
      .should('be.visible')
      .click({ force: true });

    // Click on third dropdown (grid-cols-3 first child)
    cy.get('.md\\:grid-cols-3 > :nth-child(1) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .first()
      .should('be.visible')
      .click({ force: true });

    // Click on fourth dropdown (grid-cols-3 second child)
    cy.get('.md\\:grid-cols-3 > :nth-child(2) > .border-input', { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });

    // Select first option from dropdown
    cy.get('[role="option"]', { timeout: 5000 })
      .first()
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
});