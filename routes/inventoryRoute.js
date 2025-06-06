// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
// import handleErrors
const util = require("../utilities");
const validate = require("../utilities/inventory-validation")
// Route to build inventory by classification view
router.get("/type/:classificationId",  util.handleErrors(invController.buildByClassificationId));
// Route for vehicle detail view
router.get("/detail/:invId", util.handleErrors(invController.buildItemDetails));
// Route for inventory management
router.get("/", util.handleErrors(invController.buildManagement));

// Route to display add classification view
router.get("/add-classification", util.handleErrors(invController.buildAddClassification));

// Route to handle add classification form submission
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassData,
  util.handleErrors(invController.addClassification)
)

// Route to add inventory view
router.get("/add-inventory", util.handleErrors(invController.buildAddInventory));

// Route to handle add inventory form submission
router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventoryData,
  util.handleErrors(invController.addInventory)
)

// Route to get inventory from the management view
router.get("/getInventory/:classification_id", util.handleErrors(invController.getInventoryJSON))

// Route to get the edit inventory view
router.get("/edit/:inv_id", util.handleErrors(invController.editInventory))

// Route to handle incoming update request
router.post(
  "/update", 
  validate.inventoryRules(),
  validate.checkUpdateData,
  util.handleErrors(invController.updateInventory)
)

// Route to show the delete confirmation page
router.get("/delete/:inv_id", util.handleErrors(invController.deleteConfirmation))

// Route to handle the delete request
router.post(
  "/delete", 
  util.handleErrors(invController.deleteInventoryItem)
)

module.exports = router
