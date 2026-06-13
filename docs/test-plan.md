# Test Plan

Automated test coverage for the `jenkins-cypress-pipeline` project.  
All tests run against headless Electron inside a `cypress/included:13.17.0` Docker container.

| Target | URL |
|---|---|
| E2E application | https://www.saucedemo.com |
| API under test | https://jsonplaceholder.typicode.com |

---

## Test Cases

| ID | Feature | Test Case | Type | File | Expected Result |
|---|---|---|---|---|---|
| TC-001 | Login | Successful login with valid credentials (`standard_user` / `secret_sauce`) | E2E | `cypress/e2e/login/login.cy.js` | Browser redirects to `/inventory`; inventory page is visible |
| TC-002 | Login | Failed login with invalid credentials (`invalid_user` / `wrong_password`) | E2E | `cypress/e2e/login/login.cy.js` | Error banner is visible and contains `"Username and password do not match"` |
| TC-003 | Inventory | Add first product to cart | E2E | `cypress/e2e/inventory/inventory.cy.js` | Cart badge appears and displays `"1"` |
| TC-004 | Inventory | Sort products by price low to high | E2E | `cypress/e2e/inventory/inventory.cy.js` | All displayed prices are in non-decreasing order after selecting the `lohi` sort option |
| TC-005 | Checkout | Full purchase flow: login → add product → cart → form → confirm | E2E | `cypress/e2e/checkout/checkout.cy.js` | Checkout completes; confirmation page shows `"Thank you for your order!"` |
| TC-006 | API — GET | `GET /posts/1` returns the correct resource | API | `cypress/e2e/api/api.cy.js` | HTTP 200; response body contains keys `userId`, `id`, `title`, `body`; `id` equals `1` |
| TC-007 | API — POST | `POST /posts` creates a resource and echoes the payload | API | `cypress/e2e/api/api.cy.js` | HTTP 201; response body echoes `title`, `body`, and `userId`; response contains an `id` property |

---

## Custom Commands

| Command | Defined in | Used by |
|---|---|---|
| `cy.login(username, password)` | `cypress/support/commands.js` | TC-003, TC-004, TC-005 |

---

## Page Objects

| Page Object | File | Selectors exposed |
|---|---|---|
| `LoginPage` | `cypress/support/pageObjects/LoginPage.js` | `usernameInput`, `passwordInput`, `loginButton`, `errorMessage` |
| `InventoryPage` | `cypress/support/pageObjects/InventoryPage.js` | `addToCartButton`, `cartBadge`, `sortDropdown`, `itemPrice` |
| `CheckoutPage` | `cypress/support/pageObjects/CheckoutPage.js` | `cartLink`, `checkoutButton`, `firstNameInput`, `lastNameInput`, `postalCodeInput`, `continueButton`, `finishButton`, `completeHeader` |

All selectors use `data-test` attributes from the SauceDemo application, which are stable across UI refactors.

---

## Coverage Summary

| Feature | Test Cases | Type |
|---|---|---|
| Login | 2 (happy path + error path) | E2E |
| Inventory | 2 (cart + sort) | E2E |
| Checkout | 1 (full flow) | E2E |
| REST API | 2 (GET + POST) | API |
| **Total** | **7** | |

---

## Out of Scope

- Performance testing
- Authentication flows beyond `standard_user`
- Mobile viewports
- Cross-browser testing (currently Electron only; extend via `--browser chrome` in the Jenkinsfile)
