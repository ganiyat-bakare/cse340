const invModel = require("../models/inventory-model")  
const { validationResult } = require("express-validator")  
const utilities = require("../utilities/")  

const invCont = {}  

/* ***************************  
 *  Build inventory by classification view  
 * ************************** */  
invCont.buildByClassificationId = async function (req, res, next) {  
  const classification_id = req.params.classificationId  
  try {  
    const data = await invModel.getInventoryByClassificationId(classification_id)  
    const grid = await utilities.buildClassificationGrid(data)  
    let nav = await utilities.getNav()  
    const className = data.length > 0 ? data[0].classification_name : "Classification"  
    res.render("./inventory/classification", {  
      title: className + " vehicles",  
      nav,  
      grid,  
      errors: null,  
    })  
  } catch (err) {  
    next(err)  
  }  
}  

/* ***************************  
 *  Build vehicle detail view  
 * ************************** */  
invCont.buildItemDetails = async function (req, res, next) {  
  const invId = req.params.invId  
  try {  
    const vehicleData = await invModel.getVehicleById(invId)  
    let nav = await utilities.getNav()  
    if (!vehicleData) {  
      res.status(404).render("errors/error", {  
        title: "Vehicle Not Found",  
        message: "The vehicle you are looking for could not be found.",  
        nav,  
        errors: null,  
      })  
      return  
    }  
    const grid = await utilities.buildVehicleDetailsGrid(vehicleData)  
    res.render("./inventory/inventory-detail", {  
      title: vehicleData.inv_make + " " + vehicleData.inv_model,  
      nav,  
      grid,  
      errors: null,  
    })  
  } catch (err) {  
    next(err)  
  }  
}  

/* ***************************  
 *  Build management view  
 * ************************** */  
invCont.buildManagement = async function (req, res, next) {  
  let nav = await utilities.getNav()  
  res.render("inventory/management", {  
    title: "Vehicle Management",  
    nav,  
    errors: null,  
  })  
}  

/* ***************************  
 *  Build add classification view  
 * ************************** */  
invCont.buildAddClassification = async function (req, res, next) {  
  let nav = await utilities.getNav()  
  res.render("inventory/add-classification", {  
    title: "Add Classification",  
    nav,  
    errors: null,  
  })  
}  

/* ***************************  
 *  Handle add classification  
 * ************************** */  
invCont.addClassification = async function (req, res) {  
  let nav = await utilities.getNav()  
  const { classification_name } = req.body  

  try {  
    const result = await invModel.addClassification(classification_name)  
    if (result) {  
      req.flash("notice", `The ${classification_name} was successfully added.`)  
      res.redirect("/inv/")  
    } else {  
      req.flash("notice", "Failed to add new classification.")  
      res.status(500).render("./inv/add-classification", {  
        title: "Add Classification",  
        nav,  
        errors: null,  
        classification_name  
      })  
    }  
  } catch (err) {  
    res.status(500).render("./inventory/add-classification", {  
      title: "Add Classification",  
      nav,  
      errors: [{ msg: "Error occurred while adding classification." }],  
      classification_name  
    })  
  }  
}  

/* ***************************  
 *  Build add inventory view  
 * ************************** */  
invCont.buildAddInventory = async function (req, res, next) {
  const classificationList = await utilities.buildClassificationList()
  let nav = await utilities.getNav()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    classificationList,
    nav,
    errors: null,
  })
}


/* ***************************  
 *  Handle add inventory  
 * ************************** */  
invCont.addInventory = async function (req, res) {
  const {
    classification_id, inv_make, inv_model, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  } = req.body;

  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color
  );

  if (addResult) {
    req.flash("notice", `The ${inv_make} ${inv_model} was successfully added.`);
    res.redirect("/inv/");
  } else {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    req.flash("notice", "Sorry, the vehicle could not be added.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      errors: null,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    });
  }
}

module.exports = invCont
