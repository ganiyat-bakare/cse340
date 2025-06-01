// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
// import handleErrors
const util = require('../utilities');
const validate = require('../utilities/inventory-validation')
// Route to build inventory by classification view
router.get("/type/:classificationId",  util.handleErrors(invController.buildByClassificationId));
// Route for vehicle detail view
router.get("/detail/:invId", util.handleErrors(invController.buildItemDetails));
// Route for inventory management
router.get('/', util.handleErrors(invController.buildManagement));

// Route to display add classification view
router.get('/add-classification', util.handleErrors(invController.buildAddClassification));

// Route to handle add classification form submission
router.post(
  "/add-classification",
  validate.classificationRules(),
  validate.checkClassData,
  util.handleErrors(invController.addClassification)
)

// Route to add inventory view
router.get('/add-inventory', util.handleErrors(invController.buildAddInventory));

// Route to handle add inventory form submission
router.post(
  "/add-inventory",
  validate.inventoryRules(),
  validate.checkInventoryData,
  util.handleErrors(invController.addInventory)
)

module.exports = router;
