const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildItemDetails = async function (req, res, next) {
  const invId = req.params.invId;
  try {
    const vehicleData = await invModel.getVehicleById(invId);
    let nav = await utilities.getNav()
    if (!vehicleData) {
      res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "The vehicle you are looking for could not be found.",
        nav,
      });
      return;
    }
    const grid = await utilities.buildVehicleDetailsGrid(vehicleData);
    res.render("./inventory/inventory-detail", {title: vehicleData.inv_make + " " 
      + vehicleData.inv_model, 
      nav, 
      grid,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = invCont
