const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}

/* ***************************
 *  Classification Validation Rules
 * ************************** */
validate.classificationRules = () => {
  return [
    body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Please provide a correct classification.")
  ]
}

/* ******************************
 * Check Classification Data
 * ****************************** */
validate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
      classification_name
    })
    return
  }
  next()
}

/* ***************************
 *  Inventory Item Validation Rules
 * ************************** */
validate.inventoryRules = () => {
  return [
    // Vehicle class is required and must be string
    body('classification_id')  
    .isInt()  
    .withMessage("Please select a classification."),

    // Vehicle make is required and must be string
    body("inv_make")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please provide the make of the vehicle."),

    // Vehicle model is required and must be string
    body("inv_model")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Please provide the model of the vehicle."),

    // Vehicle description is required and must be string
    body("inv_description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Please provide the vehicle description."),
    
    // Vehicle image is required and must be a path
    body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Please provide the vehicle image path."),
    
    // Vehicle thumbnail is required and must be a path 
    body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Please provide the vehicle thumbnail path."),
    
    // Vehicle price is required and must be decimal or integer
    body("inv_price")
    .trim()
    .custom(value => !value.includes(','))
    .isFloat({ min: 0 })
    .withMessage("Please provide the vehicle price."),

    // Vehicle build year is required and must be 4 digits
    body("inv_year")
    .trim()
    // .isInt({ min: 1900 })
    .matches(/^\d{4}$/)
    .notEmpty()
    .withMessage("Please provide the vehicle year."),

    // Vehicle mileage is required and must be digits
    body("inv_miles")
    .trim()
    .custom(value => !value.includes(','))
    .isInt({ min: 0 })
    .withMessage("Please provide the vehicle mileage."),
    
    // Vehicle color is required and must be string
    body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Please provide the vehicle color.")
  ]
}

/* ******************************
 * Check Inventory Data
 * ****************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Vehicle",
      nav,
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
      inv_color
    })
    return
  }
  next()
}

/* ******************************
 * Check Inventory Update Data
 * ****************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/edit-inventory", {
      title: "Edit " + inv_make + " " + inv_model,
      nav,
      errors,  
      classificationList,
      inv_id,
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
    })
    return
  }
  next()
}

module.exports = validate
