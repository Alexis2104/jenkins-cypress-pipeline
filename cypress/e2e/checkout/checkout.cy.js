const InventoryPage = require('../../support/pageObjects/InventoryPage');
const CheckoutPage  = require('../../support/pageObjects/CheckoutPage');

describe('Checkout', () => {
  it('flujo completo: login → carrito → checkout → confirmacion', () => {
    cy.login('standard_user', 'secret_sauce');
    cy.url().should('include', '/inventory');

    cy.get(InventoryPage.addToCartButton).first().click();
    cy.get(InventoryPage.cartBadge).should('have.text', '1');

    cy.get(CheckoutPage.cartLink).click();
    cy.url().should('include', '/cart');

    cy.get(CheckoutPage.checkoutButton).click();
    cy.url().should('include', '/checkout-step-one');

    cy.get(CheckoutPage.firstNameInput).type('Alexis');
    cy.get(CheckoutPage.lastNameInput).type('Macz');
    cy.get(CheckoutPage.postalCodeInput).type('12345');
    cy.get(CheckoutPage.continueButton).click();
    cy.url().should('include', '/checkout-step-two');

    cy.get(CheckoutPage.finishButton).click();
    cy.url().should('include', '/checkout-complete');

    cy.get(CheckoutPage.completeHeader)
      .should('be.visible')
      .and('have.text', 'Thank you for your order!');
  });
});
