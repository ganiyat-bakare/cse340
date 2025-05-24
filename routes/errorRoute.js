const express = require("express")
const router = express.Router()
const errorController = require("../controllers/errorController")
const utilities = require("../utilities")

router.get("/", utilities.handleErrors(errorController.triggerError))

module.exports = router
