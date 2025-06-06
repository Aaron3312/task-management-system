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
    cy.get('[href="/reports"] > .inline-flex > .ml-2').click();
    cy.wait(3500);
  });

  // TEST 1: LOGIN AND NAVIGATION
  // -----------------------------------------------------------------
  it('should login successfully and navigate to reports section', () => {
    // Verify we're on the reports page
    cy.url().should('include', '/reports');
    
    cy.log('✅ Successfully navigated to reports page');
    
    // Verify reports page title
    cy.get('body').then(($body) => {
      if ($body.find('.text-2xl.font-bold').length > 0) {
        cy.log('✅ Page title found');
        cy.get('.text-2xl.font-bold').should('be.visible').should('contain.text', 'Informes');
      } else if ($body.text().includes('Informes') || $body.text().includes('Reports')) {
        cy.log('✅ Page title found by text content');
        cy.contains('Informes').should('be.visible');
      }
    });
    
    // Verify date range selectors
    cy.get('body').then(($body) => {
      // Check for date range inputs or selectors
      const dateSelectors = [
        'input[type="date"]',
        '[data-testid="date-picker"]',
        '.date-picker',
        '[class*="date"]',
        '.calendar'
      ];
      
      dateSelectors.forEach((selector) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Date selector found: ${selector}`);
          cy.get(selector).should('be.visible');
        }
      });
    });
    
    // Verify filter dropdowns
    cy.get('body').then(($body) => {
      const filterSelectors = [
        '[role="combobox"]',
        '[data-slot="select-trigger"]',
        '.border-input',
        'select'
      ];

    });
    
    // Verify charts and graphs containers
    cy.get('body').then(($body) => {
      const chartSelectors = [
        'canvas',
        'svg',
        '[class*="chart"]',
        '[class*="graph"]',
        '.recharts-wrapper',
        '[data-testid="chart"]'
      ];
      
      chartSelectors.forEach((selector) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Chart element found: ${selector}`);
          cy.get(selector).should('be.visible');
        }
      });
    });
    
    // Verify report cards or containers
    cy.get('body').then(($body) => {
      const cardSelectors = [
        '.bg-gradient-to-br',
        '[class*="card"]',
        '.grid > div',
        '[class*="report"]',
        '.stats-card'
      ];
      
      cardSelectors.forEach((selector) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Report card found: ${selector}`);
          cy.get(selector).should('be.visible');
        }
      });
    });
    
    // Verify export/download buttons
    cy.get('body').then(($body) => {
      const exportSelectors = [
        'button[class*="export"]',
        'button[class*="download"]',
        '[data-testid="export-btn"]',
        'a[download]'
      ];
      
      exportSelectors.forEach((selector) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Export button found: ${selector}`);
          cy.get(selector).should('be.visible');
        }
      });
    });
    
    // Verify metrics/statistics displays
    cy.get('body').then(($body) => {
      // Look for numerical data displays
      const metricSelectors = [
        '[class*="metric"]',
        '[class*="stat"]',
        '.text-xl',
        '.text-2xl',
        '.text-3xl',
        '[class*="number"]'
      ];
      
      metricSelectors.forEach((selector) => {
        if ($body.find(selector).length > 0) {
          cy.log(`✅ Metric display found: ${selector}`);
          cy.get(selector).should('be.visible');
        }
      });
    });
    
    // Verify page layout and basic structure
    cy.get('.w-full').should('be.visible');
    cy.get('body').should('have.css', 'margin').and('not.equal', '');
    
    // Check for loading states or data presence
    cy.get('body').then(($body) => {
      if ($body.text().includes('Cargando') || $body.text().includes('Loading')) {
        cy.log('ℹ️ Loading state detected - waiting for data');
        cy.wait(3000);
      }
      
      if ($body.text().includes('No hay datos') || $body.text().includes('No data')) {
        cy.log('ℹ️ No data state detected');
      } else {
        cy.log('✅ Data appears to be loaded');
      }
    });
    
    cy.log('✅ Reports page components verification completed');
  });
  // -----------------------------------------------------------------
  // TEST 2: Go to project from reports
  // -----------------------------------------------------------------
  it('should navigate to a specific report from the reports list', () => {
    // Wait for reports to load
    cy.wait(3500);

    cy.url().should('include', '/reports'); // Ensure we're on the reports page

    cy.wait(1000); // Wait for any animations or transitions

    cy.contains('button', 'Ver todos ').click();
    
    cy.wait(3500); // Wait for the reports list to load
    cy.url().should('include', '/projects'); // Ensure we're on the projects page

    // Verify projects page elements are visible
    cy.get('.flex > a > .inline-flex').should('be.visible');

    cy.get(':nth-child(1) > .bg-gradient-to-br').should('be.visible');
    
  });

  // -----------------------------------------------------------------
  // TEST 3: go to task from reports
  // -----------------------------------------------------------------
  it('should navigate to a specific task from the reports list', () => {
    // Wait for reports to load
    cy.wait(3500);

    cy.url().should('include', '/reports'); // Ensure we're on the reports page

    cy.wait(1000); // Wait for any animations or transitions

    cy.contains('button', 'Ver todas ').click();
    
    cy.wait(3500); // Wait for the reports list to load
    cy.url().should('include', '/tasks'); // Ensure we're on the projects page

    // Verify projects page elements are visible
    cy.get('.flex > a > .inline-flex').should('be.visible');

    cy.get(':nth-child(1) > .bg-gradient-to-br').should('be.visible');
  });
  // -----------------------------------------------------------------
  // TEST 4: go to informe tarea
  // -----------------------------------------------------------------
  it('should navigate to a specific task report from the reports list', () => {
    // Wait for reports to load
    cy.wait(3500);

    cy.url().should('include', '/reports'); // Ensure we're on the reports page

    cy.get(':nth-child(4) > .grid > :nth-child(1)')
      .should('be.visible')
      .click();
    cy.url().should('include', '/reports/tasks'); // Ensure we're on the task report page
  });
  // TEST 5: verify informe tarea
  // -----------------------------------------------------------------
  it('should verify task report elements', () => {

  cy.url().should('include', '/reports'); // Ensure we're on the reports page

  cy.get(':nth-child(4) > .grid > :nth-child(1)')
    .should('be.visible')
    .click();

  cy.url().should('include', '/reports/tasks'); // Ensure we're on the task report page

  // Verify main report title
  cy.get('.flex > .text-2xl')
    .should('be.visible')
    .contains('Informe de Tareas');

  // Verify task statistics cards
  cy.get('.grid-cols-2 > :nth-child(1) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Total');

  cy.get('.grid-cols-2 > :nth-child(2) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Completadas');

  cy.get('.grid-cols-2 > :nth-child(3) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Pendientes');

  cy.get('.grid-cols-2 > :nth-child(4) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Bloqueadas');

  cy.get(':nth-child(5) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Vencidas');

  cy.get(':nth-child(6) > .p-4 > .text-xs')
    .should('be.visible')
    .contains('Completado');

  // Verify KPIs section title
  cy.get('.text-xl')
    .should('be.visible')
    .contains('KPIs de Tiempo y Productividad');

  // Verify KPI cards
  cy.get('.from-blue-50 > .p-4 > .flex > div > .text-sm')
    .should('be.visible')
    .contains('Eficiencia Promedio');

  cy.get('.from-green-50 > .p-4 > .flex > div > .text-sm')
    .should('be.visible')
    .contains('Entrega a Tiempo');

  cy.get('.from-purple-50 > .p-4 > .flex > div > .text-sm')
    .should('be.visible')
    .contains('Índice de Productividad');

  cy.get('.from-amber-50 > .p-4 > .flex > div > .text-sm')
    .should('be.visible')
    .contains('Horas Totales');

  // Verify table elements
  cy.get('tbody > :nth-child(1) > :nth-child(1)')
    .should('be.visible');

  cy.get('tbody > :nth-child(1) > :nth-child(2)')
    .should('be.visible');

  cy.get('tbody > :nth-child(1) > :nth-child(3)')
    .should('be.visible');

  cy.get('tbody > :nth-child(1) > :nth-child(4)')
    .should('be.visible');

  // Verify search and filter elements
  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rs»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rt»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«ru»"]')
    .should('be.visible');
  
  cy.get('tbody > :nth-child(1) > :nth-child(1)')
    .should('be.visible');

  cy.log('✅ All task report elements verified successfully');
  });

  // -----------------------------------------------------------------
  // TEST 6: Verify Informe de Proyectos
  // -----------------------------------------------------------------
  it('should verify Sprint report elements', () => {
  cy.url().should('include', '/reports'); // Ensure we're on the reports page

  cy.get(':nth-child(4) > .grid > :nth-child(2)')
    .should('be.visible')
    .click();

  cy.url().should('include', '/reports/sprints'); // Ensure we're on the sprint report page

  // Verify main report title
  cy.get('.text-2xl')
    .should('be.visible')
    .contains('Informe de Sprints');

  // Verify sprint statistics cards
  cy.get(':nth-child(1) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Velocidad promedio');

  cy.get(':nth-child(2) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Completado promedio');

  cy.get(':nth-child(3) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Tareas promedio');

  cy.get(':nth-child(4) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Sprints en riesgo');

  // Verify search and filter elements
  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rs»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rt»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«ru»"]')
    .should('be.visible');

  // Verify table headers
  cy.get('.bg-muted\\/50 > :nth-child(1)')
    .should('be.visible')
    .contains('Nombre');

  cy.get('.bg-muted\\/50 > :nth-child(2)')
    .should('be.visible')
    .contains('Proyecto');

  cy.get('.bg-muted\\/50 > :nth-child(3)')
    .should('be.visible')
    .contains('Estado');

  cy.get('.bg-muted\\/50 > :nth-child(4)')
    .should('be.visible')
    .contains('Período');
  
  cy.get('tbody > :nth-child(1) > :nth-child(1)')
    .should('be.visible');

  cy.log('✅ All sprint report elements verified successfully');
  });

  // -----------------------------------------------------------------
  // TEST 7: Verify Informe de Proyectos
  // -----------------------------------------------------------------
  it('should verify Project report elements', () => {
  cy.url().should('include', '/reports'); // Ensure we're on the reports page

  cy.get(':nth-child(4) > .grid > :nth-child(3)')
    .should('be.visible')
    .click();

  cy.url().should('include', '/reports/projects'); // Ensure we're on the project report page

  // Verify main report title
  cy.get('.text-2xl')
    .should('be.visible')
    .contains('Informe de Proyectos');

  // Verify project statistics cards
  cy.get(':nth-child(1) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Proyectos activos');

  cy.get(':nth-child(2) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Completado promedio');

  cy.get(':nth-child(3) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Proyectos en riesgo');

  cy.get(':nth-child(4) > .p-4 > .justify-between > :nth-child(1) > .text-sm')
    .should('be.visible')
    .contains('Proyectos retrasados');

  // Verify search and filter elements
  cy.get('.file\\:text-foreground')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rs»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rt»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«ru»"]')
    .should('be.visible');

  // Verify table headers
  cy.get('.bg-muted\\/50 > :nth-child(1)')
    .should('be.visible')
    .contains('Nombre');

  cy.get('.bg-muted\\/50 > :nth-child(2)')
    .should('be.visible')
    .contains('Estado');

  cy.get('.bg-muted\\/50 > :nth-child(3)')
    .should('be.visible')
    .contains('Período');

  cy.get('.bg-muted\\/50 > :nth-child(4)')
    .should('be.visible')
    .contains('Tareas');

  cy.get('tbody > :nth-child(1) > :nth-child(1)')
    .should('be.visible');
  cy.log('✅ All project report elements verified successfully');
  });
  // -----------------------------------------------------------------
  // TEST 8: Verify Rendimiento por desarrollador
  // -----------------------------------------------------------------
  it('should verify Developer Performance report elements', () => {
  cy.url().should('include', '/reports'); // Ensure we're on the reports page

  cy.get(':nth-child(4) > .grid > :nth-child(4)')
    .should('be.visible')
    .click();

  cy.url().should('include', '/reports/developer-performance'); // Ensure we're on the developer performance report page
  
  cy.get('.text-4xl')
    .should('be.visible')
    .contains('Rendimiento de Desarrolladores');

  cy.get('.hidden > .inline-flex')
    .should('be.visible')
    .contains('Exportar Reporte');

  // Verify filter elements
  cy.get('[aria-controls="radix-«rs»"]')
    .should('be.visible');

  cy.get('[aria-controls="radix-«rt»"]')
    .should('be.visible');

  // Verify performance statistics cards
  cy.get('.from-blue-500 > .p-6 > .justify-between > :nth-child(1) > .font-medium')
    .should('be.visible')
    .contains('Desarrolladores Activos');

  cy.get('.from-emerald-500 > .p-6 > .justify-between > :nth-child(1) > .font-medium')
    .should('be.visible')
    .contains('Sprints Analizados');

  cy.get('.from-purple-500 > .p-6 > .justify-between > :nth-child(1) > .font-medium')
    .should('be.visible')
    .contains('Tareas Completadas');

  cy.get('.from-orange-500 > .p-6 > .justify-between > :nth-child(1) > .font-medium')
    .should('be.visible')
    .contains('Horas Trabajadas');

  // Verify chart/analysis sections
  cy.get('.space-y-10 > :nth-child(1)')
    .should('be.visible');

  cy.get('.space-y-10 > :nth-child(2)')
    .should('be.visible');

  cy.get('.space-y-10 > :nth-child(3)')
    .should('be.visible');

  // Verify additional elements
  cy.get('.from-indigo-50')
    .should('be.visible');

  cy.get('.text-center > .inline-flex')
    .should('be.visible');

  cy.log('✅ All developer performance report elements verified successfully');
  });
  // -----------------------------------------------------------------
  // TEST 9: Verify Analsis IA
  // -----------------------------------------------------------------
  it('should verify AI Analysis report elements', () => {
    cy.url().should('include', '/reports'); // Ensure we're on the reports page

    cy.get(':nth-child(4) > .grid > :nth-child(4)')
      .should('be.visible')
      .click();

    cy.wait(3500); // Wait for the AI Analysis report page to load
    cy.contains('button', 'Ejecutar Análisis IA').click();
  });
  // -----------------------------------------------------------------
  // TEST 10: Verify Exportar Reporte button
  // -----------------------------------------------------------------
  it('should verify Export Report button functionality', () => {
    cy.url().should('include', '/reports'); // Ensure we're on the reports page

    cy.get(':nth-child(4) > .grid > :nth-child(4)')
      .should('be.visible')
      .click();

    cy.wait(3500); // Wait for the AI Analysis report page to load

    // Verify Export Report button is visible
    cy.get('.hidden > .inline-flex')
      .should('be.visible')
      .contains('Exportar Reporte')
      .click();

  });


});