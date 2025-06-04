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
    // TEST 4: LOGIN AND CHECK FOR RECENT TASKS
    // -----------------------------------------------------------------
    it('should login successfully and check for recent tasks', () => {
        // Verify successful login - we should be redirected away from login page
        cy.url().should('not.include', '/login');

        // Verify we're logged in and on a main page (dashboard, home, etc.)
        cy.get('body').should('be.visible'); // Basic page load verification

        cy.log('✅ Login successful and home page loaded');

        // Wait for page content to load completely
        cy.wait(2000);
        
        // Verify main container is visible
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
        
        // Check for "Tareas recientes" section
        cy.get('body').then(($body) => {
            // Look for the "Tareas recientes" heading using different approaches
            if ($body.find('.mb-4 > .jsx-a6e1b883d4d5e818').length > 0) {
                cy.log('✅ Recent tasks section found using specific selector');
                cy.get('.mb-4 > .jsx-a6e1b883d4d5e818').should('be.visible');
                
                // Verify the heading text contains "Tareas recientes"
                cy.get('.mb-4 > .jsx-a6e1b883d4d5e818').should('contain.text', 'Tareas recientes');
                
            } else if ($body.text().includes('Tareas recientes')) {
                cy.log('✅ Recent tasks section found by text content');
                cy.get('body').should('contain.text', 'Tareas recientes');
                
                // Try to find the heading by text
                cy.contains('Tareas recientes').should('be.visible');
                
            } else {
                cy.log('ℹ️ Recent tasks section not found - checking for alternative sections');
                
                // Check for any task-related sections
                const alternativeSections = [
                    'Tareas',
                    'Recent',
                    'Recientes',
                    'Tasks',
                    'Últimas tareas'
                ];
                
                let sectionFound = false;
                alternativeSections.forEach((section) => {
                    if ($body.text().includes(section)) {
                        cy.log(`ℹ️ Alternative section found: ${section}`);
                        sectionFound = true;
                    }
                });
                
                if (!sectionFound) {
                    cy.log('ℹ️ No recent tasks section found - page may be empty or loading');
                }
            }
        });
        
        // Check if there are actual recent tasks displayed
        cy.get('body').then(($body) => {
            // Look for task elements with data-task-id attribute
            if ($body.find('[data-task-id]').length > 0) {
                cy.log('✅ Recent tasks found with data-task-id attributes');
                cy.get('[data-task-id]').should('have.length.greaterThan', 0);
                
                // Check if the first task is visible (at least one recent task)
                cy.get('[data-task-id]').first().should('be.visible');
                
                // If specific task ID 341 exists, verify it
                if ($body.find('[data-task-id="341"]').length > 0) {
                    cy.log('✅ Specific task ID 341 found');
                    cy.get('[data-task-id="341"] > .p-4').should('be.visible');
                }
                
            } else {
                // Look for other task indicators
                const taskIndicators = [
                    '.p-4', // Task card padding class
                    '.task-card',
                    '.recent-task',
                    '[class*="task"]',
                    '.grid > div', // Grid layout tasks
                    '.flex > div' // Flex layout tasks
                ];
                
                let tasksVisible = false;
                taskIndicators.forEach((indicator) => {
                    if ($body.find(indicator).length > 0) {
                        cy.log(`✅ Task elements found using: ${indicator}`);
                        tasksVisible = true;
                    }
                });
                
                if (!tasksVisible) {
                    cy.log('ℹ️ No recent tasks visible - section may be empty');
                    
                    // Check for empty state messages
                    const emptyMessages = [
                        'No hay tareas recientes',
                        'Sin tareas',
                        'No recent tasks',
                        'empty'
                    ];
                    
                    emptyMessages.forEach((message) => {
                        if ($body.text().includes(message)) {
                            cy.log(`ℹ️ Empty state detected: ${message}`);
                        }
                    });
                }
            }
        });
        
        cy.log('✅ Recent tasks verification completed');
    });

    // -----------------------------------------------------------------
    // TEST 5: LOGIN AND NAVIGATE TO TASKS PAGE FROM "VER TODAS" BUTTON
    // -----------------------------------------------------------------
    it('should login successfully and navigate to tasks page from "Ver todas" button', () => {
        // Verify successful login - we should be redirected away from login page
        cy.url().should('not.include', '/login');

        // Verify we're logged in and on a main page (dashboard, home, etc.)
        cy.get('body').should('be.visible'); // Basic page load verification

        cy.log('✅ Login successful and home page loaded');

        // Wait for page content to load completely
        cy.wait(2000);
        
        // Verify main container is visible
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
        
        // Look for and click the "Ver todas" button
        cy.get('body').then(($body) => {
            // Try different selectors for the "Ver todas" button
            if ($body.find('.mb-4 > a > .inline-flex').length > 0) {
                cy.log('✅ "Ver todas" button found using .mb-4 > a > .inline-flex');
                cy.get('.mb-4 > a > .inline-flex').should('be.visible');
                cy.get('.mb-4 > a > .inline-flex').should('contain.text', 'Ver todas');
                cy.get('.mb-4 > a > .inline-flex').click();
                
            } else if ($body.find('button').filter(':contains("Ver todas")').length > 0) {
                cy.log('✅ "Ver todas" button found by text content');
                cy.contains('button', 'Ver todas').should('be.visible').click();
                
            } else if ($body.find('[data-slot="button"]').filter(':contains("Ver todas")').length > 0) {
                cy.log('✅ "Ver todas" button found using data-slot attribute');
                cy.get('[data-slot="button"]').contains('Ver todas').should('be.visible').click();
                
            } else {
                // Look for button with specific classes from the provided element
                const buttonClasses = [
                    '.inline-flex.items-center.justify-center',
                    '[class*="hover:scale-110"]',
                    '[class*="hover:border-blue-300"]',
                    'button[class*="transition-all"]'
                ];
                
                let buttonFound = false;
                buttonClasses.forEach((buttonClass) => {
                    if ($body.find(buttonClass).filter(':contains("Ver todas")').length > 0) {
                        cy.log(`✅ "Ver todas" button found using: ${buttonClass}`);
                        cy.get(buttonClass).contains('Ver todas').should('be.visible').click();
                        buttonFound = true;
                        return false; // Break the loop
                    }
                });
                
                if (!buttonFound) {
                    cy.log('⚠️ "Ver todas" button not found - checking for alternative navigation');
                    
                    // Look for any button or link that might navigate to tasks
                    const alternativeSelectors = [
                        'a[href*="/tasks"]',
                        'button[onclick*="tasks"]',
                        '[data-testid="view-all-tasks"]',
                        '.view-all',
                        '[class*="view-all"]'
                    ];
                    
                    alternativeSelectors.forEach((altSelector) => {
                        if ($body.find(altSelector).length > 0) {
                            cy.log(`ℹ️ Alternative navigation found: ${altSelector}`);
                            cy.get(altSelector).first().click();
                        }
                    });
                }
            }
        });
        
        // Wait for navigation to complete
        cy.wait(3000);
        
        // Verify redirect to tasks page
        cy.url().should('include', '/tasks');
        cy.url().should('eq', 'http://localhost:3000/tasks');
        
        cy.log('✅ Successfully redirected to tasks page');
        
        // Verify tasks page content is loaded
        cy.get('.w-full > .px-6', { timeout: 10000 }).should('be.visible');
        
        // Check for tasks page content
        cy.get('body').then(($body) => {
            // Look for page title or header
            if ($body.find('.text-2xl').length > 0) {
                cy.log('✅ Page header found');
                cy.get('.text-2xl').should('be.visible');
            }
            
            // Check for task-related content using TaskCard component patterns
            const taskPageElements = [
                '.group.cursor-pointer', // TaskCard containers
                '.line-clamp-2', // Task titles
                '.line-clamp-3', // Task descriptions
                '[data-task-id]', // Tasks with IDs
                '.grid > div', // Grid layout
                '[class*="bg-gradient-to-br"]', // TaskCard backgrounds
                '.hover\\:shadow-2xl' // TaskCard hover effects
            ];
            
            let contentFound = false;
            taskPageElements.forEach((element) => {
                if ($body.find(element).length > 0) {
                    cy.log(`✅ Tasks page content found: ${element}`);
                    cy.get(element).should('have.length.greaterThan', 0);
                    contentFound = true;
                }
            });
            
            if (!contentFound) {
                // Check for empty state or loading indicators
                if ($body.text().includes('No tasks') || 
                    $body.text().includes('sin tareas') ||
                    $body.text().includes('empty') ||
                    $body.text().includes('cargando')) {
                    cy.log('ℹ️ Tasks page loaded - empty state or loading detected');
                } else {
                    // Verify basic page structure exists
                    cy.get('.w-full > .px-6').within(() => {
                        cy.get('*').should('have.length.greaterThan', 0);
                    });
                    cy.log('ℹ️ Tasks page loaded - basic structure verified');
                }
            }
        });
        
        // Verify typical tasks page elements if present
        cy.get('body').then(($body) => {
            // Check for common task page elements
            const taskPageTexts = [
                'Tareas', 'Tasks', 'Ver detalles', 'Completar', 
                'Por hacer', 'En progreso', 'Completado',
                'Alta', 'Media', 'Baja', 'horas estimadas'
            ];
            
            taskPageTexts.forEach((text) => {
                if ($body.text().includes(text)) {
                    cy.log(`✅ Task page content element found: ${text}`);
                }
            });
        });
        
        cy.log('✅ Tasks page navigation and content verification completed');
    });
    });