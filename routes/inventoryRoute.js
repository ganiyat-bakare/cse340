// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
// import handleErrors
const util = require('../utilities');
// Route to build inventory by classification view
router.get("/type/:classificationId",  util.handleErrors(invController.buildByClassificationId));
// Route for vehicle detail view
router.get("/detail/:invId", util.handleErrors(invController.buildItemDetails));

module.exports = router;
