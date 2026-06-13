const LoginPage = require('../../support/pageObjects/LoginPage');

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('login exitoso con credenciales válidas', () => {
    cy.get(LoginPage.usernameInput).type('standard_user');
    cy.get(LoginPage.passwordInput).type('secret_sauce');
    cy.get(LoginPage.loginButton).click();
    cy.url().should('include', '/inventory');
  });

  it('login fallido muestra mensaje de error', () => {
    cy.get(LoginPage.usernameInput).type('invalid_user');
    cy.get(LoginPage.passwordInput).type('wrong_password');
    cy.get(LoginPage.loginButton).click();
    cy.get(LoginPage.errorMessage)
      .should('be.visible')
      .and('contain', 'Username and password do not match');
  });
});
