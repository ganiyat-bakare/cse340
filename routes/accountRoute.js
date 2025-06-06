/* *********************************
 * Account routes
 * ********************************/
const regValidate = require("../utilities/account-validation")

// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

/* *********************************
 * Deliver Account Management View
 * ********************************/
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

/* *********************************
 * Deliver Login View
 * ********************************/
router.get("/login", utilities.handleErrors(accountController.buildLogin))

/* *********************************
 * Deliver Registration View
 * ********************************/
router.get("/register", utilities.handleErrors(accountController.buildRegister))

/* *********************************
 * Process Registration
 * ********************************/
router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

/* *********************************
 * Process the login request
 * ********************************/
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
