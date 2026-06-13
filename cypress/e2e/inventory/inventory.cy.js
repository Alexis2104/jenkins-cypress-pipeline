const InventoryPage = require('../../support/pageObjects/InventoryPage');

describe('Inventory', () => {
  beforeEach(() => {
    cy.login('standard_user', 'secret_sauce');
    cy.url().should('include', '/inventory');
  });

  it('agregar producto al carrito actualiza el badge', () => {
    cy.get(InventoryPage.addToCartButton).first().click();
    cy.get(InventoryPage.cartBadge).should('be.visible').and('have.text', '1');
  });

  it('ordenar productos por precio de menor a mayor', () => {
    cy.get(InventoryPage.sortDropdown).select('lohi');

    cy.get(InventoryPage.itemPrice).then(($prices) => {
      const prices = [...$prices].map((el) =>
        parseFloat(el.innerText.replace('$', ''))
      );
      const sorted = [...prices].sort((a, b) => a - b);
      expect(prices).to.deep.equal(sorted);
    });
  });
});
