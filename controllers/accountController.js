const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")  

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  const reviews = await invModel.getReviewsByAccountId(accountData.account_id)

  res.render("account/management", {
    title: "Account Management",
    nav,
    message: "You're logged in!",
    errors: null,
    accountFirstname: accountData.account_firstname,
    accountType: accountData.account_type,
    reviews
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname, 
    account_lastname, 
    account_email, 
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Build update account view
 * ************************************ */
const buildUpdateAccount = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id);
  try {
    const accountData = await accountModel.getAccountById(account_id)
    let nav = await utilities.getNav()
    res.render("account/update", {
      title: "Update Account",
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id: accountData.account_id,
      errors: null,
    })
  } catch (error) {
    next(error)
  }
}


/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res, next) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Your Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      errors,
    })
  }

  try {
    const result = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (result) {
      // Refresh JWT with updated account data
      const updatedAccountData = await accountModel.getAccountById(account_id)
      delete updatedAccountData.account_password

      const accessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if (process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      req.flash("message", "Your account information has been updated successfully.")
    } else {
      req.flash("notice", "Account update failed. Please try again.")
    }
    res.redirect("/account/")
  } catch (err) {
    next(err)
  }
}


/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res, next) {
  const errors = validationResult(req);
  const { account_id, account_password } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    return res.render('account/update', {
      title: 'Update Your Account',
      nav,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_id,
      errors,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    await accountModel.updatePassword(hashedPassword, account_id);
    req.flash("message", "Your password has been successfully updated.");
    res.redirect("/account");
  } catch (err) {
    next(err);
  }
}


/* ****************************************
 *  Process logout request
 * ************************************ */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}


module.exports = { buildManagement, buildLogin, buildRegister, registerAccount, accountLogin, logoutAccount, buildUpdateAccount, updateAccount, updatePassword }
