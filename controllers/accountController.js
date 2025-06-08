const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData

  res.render("account/management", {
    title: "Account Management",
    nav,
    message: "You're logged in!",
    errors: null,
    accountFirstname: accountData.account_firstname,
    accountType: accountData.account_type,
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
  const account_id = req.params.account_id;
  const accountData = await accountModel.getAccountById(account_id);
  let nav = await utilities.getNav();
  // Render the form with current account data
  res.render('account/update', {
    title: 'Update Account',
    nav,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    errors: null
  });
};

/* ****************************************
 *  Process account update
 * ************************************ */
async function updateAccount(req, res, next) {
  const errors = validationResult(req);
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  if (!errors.isEmpty()) {
    // repopulate form with submitted data
    let nav = await utilities.getNav();
    return res.render('account/update', {
      title: 'Update Your Account',
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      errors: null
    });
  }

  try {
    const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
    req.flash("notice", "Your account information has been updated.");
    res.redirect(`/account/update/${account_id}`);
  } catch (err) {
    next(err);
  }
}

/* ****************************************
 *  Process password update
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { accountPassword } = req.body
  const accountId = req.session.accountId

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    req.flash("notice", errors.array().map(e => e.msg).join(", "))
    return res.redirect("/account/update-password")
  }

  try {
    const hashedPassword = await bcrypt.hash(accountPassword, 10)
    const result = await accountModel.updatePassword(accountId, hashedPassword)
    if (result) {
      req.flash("notice", "Password updated successfully.")
    } else {
      req.flash("notice", "Password update failed. Please try again.")
    }
    res.redirect("/account/update-password")
  } catch (error) {
    console.error("Password Update Error:", error)
    req.flash("notice", "An error occurred. Please try again.")
    res.redirect("/account/update-password")
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
