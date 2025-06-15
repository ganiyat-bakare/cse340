// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
// import handleErrors
const util = require("../utilities");
const validate = require("../utilities/inventory-validation")


// Route to review edit view form
router.get("/review/edit/:reviewId", util.checkJWTToken, util.checkLogin, util.handleErrors(invController.buildEditReview))

// Route to handle review update
router.post(
  "/review/edit",
  util.checkJWTToken, 
  util.checkLogin,
  validate.reviewRules(),
  validate.checkUpdateReviewData,
  util.handleErrors(invController.updateReview)
)

// Route to handle review deletion confirmation view
router.get("/review/delete/:reviewId", util.checkJWTToken, util.checkLogin, util.handleErrors(invController.buildDeleteReview))

// Route to handle review deletion process
router.post(
  "/review/delete",
  util.checkJWTToken, 
  util.checkLogin,
  util.handleErrors(invController.deleteReview)
)

// Route to build inventory by classification view
router.get("/type/:classificationId",  util.handleErrors(invController.buildByClassificationId));

// Route for vehicle detail view
router.get("/detail/:invId", util.handleErrors(invController.buildItemDetails));

// Route to build the review form
router.get("/review/:invId", util.handleErrors(invController.buildReviewForm));

// Route to handle review form submission
router.post(
  "/review",
  util.checkJWTToken,
  util.checkLogin,
  validate.reviewRules(),
  validate.checkReviewData,
  util.handleErrors(invController.addItemReview)
)

// Protect all inventory routes
router.use(util.checkJWTToken, util.checkLogin, util.checkAccountType)

// Route for inventory management
router.get("/", util.checkJWTToken, util.checkLogin, util.checkAccountType, util.handleErrors(invController.buildManagement));

// Route to display add classification view
router.get("/add-classification", util.checkJWTToken, util.checkLogin, util.checkAccountType, util.handleErrors(invController.buildAddClassification));

// Route to handle add classification form submission
router.post(
  "/add-classification",
  util.checkJWTToken, 
  util.checkLogin,
  util.checkAccountType,
  validate.classificationRules(),
  validate.checkClassData,
  util.handleErrors(invController.addClassification)
)

// Route to add inventory view
router.get("/add-inventory", util.checkJWTToken, util.checkLogin, util.checkAccountType, util.handleErrors(invController.buildAddInventory));

// Route to handle add inventory form submission
router.post(
  "/add-inventory",
  util.checkJWTToken,
  util.checkLogin, 
  util.checkAccountType,
  validate.inventoryRules(),
  validate.checkInventoryData,
  util.handleErrors(invController.addInventory)
)

// Route to get inventory from the management view
router.get("/getInventory/:classification_id", util.handleErrors(invController.getInventoryJSON))

// Route to get the edit inventory view
router.get("/edit/:inv_id", util.checkJWTToken, util.checkLogin, util.checkAccountType, util.handleErrors(invController.editInventory))

// Route to handle incoming update request
router.post(
  "/update", 
  util.checkJWTToken,
  util.checkLogin, 
  util.checkAccountType,
  validate.inventoryRules(),
  validate.checkUpdateData,
  util.handleErrors(invController.updateInventory)
)

// Route to show the delete confirmation page
router.get("/delete/:inv_id", util.checkJWTToken, util.checkLogin, util.checkAccountType, util.handleErrors(invController.deleteConfirmation))

// Route to handle the delete request
router.post(
  "/delete", 
  util.checkJWTToken, 
  util.checkLogin,
  util.checkAccountType,
  util.handleErrors(invController.deleteInventoryItem)
)


module.exports = router
