/* *********************************
 * Account routes
 * ********************************/
const regValidate = require('../utilities/account-validation')

// Needed Resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")

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

// Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router
