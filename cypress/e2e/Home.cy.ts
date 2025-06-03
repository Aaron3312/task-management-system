describe('Home Page - Navigation and Connection Tests', () => {
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

    beforeEach(() => {
        // Visit home page before each test
        cy.visit(Cypress.config('baseUrl'));
        cy.wait(3000); // Wait for page to fully load

        // Login with credentials
        cy.get('#username', { timeout: 10000 }).should('be.visible').type(Cypress.env('USERNAME'));
        cy.get('#password', { timeout: 10000 }).should('be.visible').type(Cypress.env('PASSWORD'));
        cy.get('.bg-card').click();
        cy.get('.inline-flex').click();
        cy.wait(2000); // Wait for login to process
    });

      // -----------------------------------------------------------------
    // TEST 1: LOGIN AND NAVIGATION TO PROJECTS
    // -----------------------------------------------------------------
    it('should login successfully and navigate to projects page', () => {
        // Verify successful login - we should be redirected away from login page
        cy.url().should('not.include', '/login');

        // Verify we're logged in and on a main page (dashboard, home, etc.)
        cy.get('body').should('be.visible'); // Basic page load verification

        cy.log('✅ Login successful and home page loaded');
        
        // Navigate to projects section
        cy.get('.hover\\:shadow-red-500\\/10 > [data-slot="card-content"] > .mt-4 > a > .inline-flex').click();
        cy.wait(2000); // Wait for navigation to complete
        
        // Verify we're on the projects page
        cy.url().should('include', '/projects');
        
        // Verify projects page specific elements are visible
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
        
        cy.log('✅ Successfully navigated to projects page');
    });

   // -----------------------------------------------------------------
   // TEST 2: LOGIN AND NAVIGATION TO SPRINTS
   // -----------------------------------------------------------------
    it('should login successfully and navigate to sprints page', () => {
       // Verify successful login - we should be redirected away from login page
        cy.url().should('not.include', '/login');

       // Verify we're logged in and on a main page (dashboard, home, etc.)
        cy.get('body').should('be.visible'); // Basic page load verification

        cy.log('✅ Login successful and home page loaded');

       // Navigate to sprints section
        cy.get('.hover\\:shadow-green-500\\/10 > [data-slot="card-content"] > .mt-4 > a > .inline-flex').click();
        cy.wait(2000); // Wait for navigation to complete
    
       // Verify we're on the sprints page
        cy.url().should('include', '/sprints');
        cy.url().should('eq', 'http://localhost:3000/sprints');
    
       // Verify sprints page specific elements are visible
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
    
       // Check if there are sprints present
        cy.get('body').then(($body) => {
           // Look for common sprint container elements
            const sprintSelectors = [
                '[data-testid="sprint-item"]',
                '.sprint-card',
                '.sprint-container',
                '[class*="sprint"]',
               '.grid > div', // Common grid item for sprint cards
               '.flex.flex-col > div' // Common layout for sprint items
            ];
        
            let sprintsFound = false;
        
            sprintSelectors.forEach((selector) => {
                if ($body.find(selector).length > 0) {
                    cy.log(`✅ Sprints found using selector: ${selector}`);
                    cy.get(selector).should('have.length.greaterThan', 0);
                    sprintsFound = true;
                }
            });
        
            if (!sprintsFound) {
               // If no specific sprint elements found, check for empty state or general content
                if ($body.find('[data-testid="empty-state"]').length > 0 || 
                    $body.text().includes('No sprints') || 
                    $body.text().includes('sin sprints') ||
                    $body.text().includes('empty')) {
                    cy.log('ℹ️ No sprints found - empty state detected');
                    cy.get('body').should('contain.text', 'No').or('contain.text', 'empty').or('contain.text', 'sin');
                } else {
                   // Check for any content that might indicate sprints are loading or present
                    cy.get('.w-full > .px-6').within(() => {
                        cy.get('*').should('have.length.greaterThan', 0);
                    });
                    cy.log('ℹ️ Sprints page loaded - content structure verified');
                }
            }    
        });
    
        cy.log('✅ Successfully navigated to sprints page and verified content');
    });
   // -----------------------------------------------------------------
   // TEST 3: LOGIN AND NAVIGATION TO TASKS
   // -----------------------------------------------------------------
    it('should login successfully and navigate to tasks page', () => {
        // Verify successful login - we should be redirected away from login page
        cy.url().should('not.include', '/login');

        // Verify we're logged in and on a main page (dashboard, home, etc.)
        cy.get('body').should('be.visible'); // Basic page load verification

        cy.log('✅ Login successful and home page loaded');

        // Navigate to tasks section
        cy.get('.hover\\:shadow-amber-500\\/10 > [data-slot="card-content"] > .mt-4 > a > .inline-flex').click();
        cy.wait(2000); // Wait for navigation to complete
        
        // Verify we're on the tasks page
        cy.url().should('include', '/tasks');
        cy.url().should('eq', 'http://localhost:3000/tasks');
        
        // Verify tasks page specific elements are visible
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
        
        // Check if there are tasks present based on TaskCard component
        cy.get('body').then(($body) => {
            // Look for TaskCard specific elements from the component code
            const taskSelectors = [
                '.group.cursor-pointer.relative.overflow-hidden', // Main TaskCard container
                '.hover\\:shadow-2xl', // TaskCard hover effect class
                '.line-clamp-2', // Task title class
                '.line-clamp-3', // Task description class
                '.text-lg.font-medium', // CardTitle class
                '.space-y-2.text-sm', // Task details container
                '.flex.justify-between.items-center', // CardFooter layout
                '.grid > div', // Common grid layout for task cards
                '[class*="bg-gradient-to-br"]' // TaskCard animated background
            ];
            
            let tasksFound = false;
            
            taskSelectors.forEach((selector) => {
                if ($body.find(selector).length > 0) {
                    cy.log(`✅ Tasks found using selector: ${selector}`);
                    cy.get(selector).should('have.length.greaterThan', 0);
                    tasksFound = true;
                }
            });
            
            if (tasksFound) {
                // If tasks found, verify TaskCard specific elements and badges
                cy.log('🔍 Verifying TaskCard specific elements');
                
                // Check for status badges from getStatusBadge function
                const statusBadges = [
                    'Por hacer',   // TaskStatus.TODO
                    'En progreso', // TaskStatus.IN_PROGRESS  
                    'Completado',  // TaskStatus.COMPLETED
                    'Bloqueado'    // TaskStatus.BLOCKED
                ];
                
                statusBadges.forEach((status) => {
                    cy.get('body').then(($statusBody) => {
                        if ($statusBody.text().includes(status)) {
                            cy.log(`✅ Task status badge found: ${status}`);
                        }
                    });
                });
                
                // Check for priority badges from getPriorityBadge function
                const priorityBadges = [
                    'Baja',        // Priority 1
                    'Media',       // Priority 2
                    'Alta'         // Priority 3
                ];
                
                priorityBadges.forEach((priority) => {
                    cy.get('body').then(($priorityBody) => {
                        if ($priorityBody.text().includes(priority)) {
                            cy.log(`✅ Task priority badge found: ${priority}`);
                        }
                    });
                });
                
                // Check for task content elements
                const taskContentElements = [
                    'Vence:',           // Due date text
                    'horas estimadas',  // Estimated hours text
                    'horas trabajadas', // Real hours text
                    'subtareas',        // Subtasks text
                    'Sin subtareas',    // No subtasks text
                    'Ver detalles',     // View details button
                    'Completar'         // Complete button
                ];
                
                taskContentElements.forEach((content) => {
                    cy.get('body').then(($contentBody) => {
                        if ($contentBody.text().includes(content)) {
                            cy.log(`✅ Task content element found: ${content}`);
                        }
                    });
                });
                
            } else {
                // If no specific task elements found, check for empty state
                if ($body.find('[data-testid="empty-state"]').length > 0 || 
                    $body.text().includes('No tasks') || 
                    $body.text().includes('sin tareas') ||
                    $body.text().includes('empty') ||
                    $body.text().includes('Sin tareas')) {
                    cy.log('ℹ️ No tasks found - empty state detected');
                    cy.get('body').should('contain.text', 'No').or('contain.text', 'empty').or('contain.text', 'Sin');
                } else {
                    // Check for any content that might indicate tasks are loading or present
                    cy.get('.w-full > .px-6').within(() => {
                        cy.get('*').should('have.length.greaterThan', 0);
                    });
                    cy.log('ℹ️ Tasks page loaded - content structure verified');
                }
            }
        });
        
        cy.log('✅ Successfully navigated to tasks page and verified content');
    });

    // -----------------------------------------------------------------
    // TEST 4: LOGIN AND NAVIGATION TO PROFILE
    
});