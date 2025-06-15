const utilities = require(".")
const invModel = require("../models/inventory-model")  
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
  let nav = await utilities.getNav()
  if (!errors.isEmpty()) {
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
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
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Please provide the make of the vehicle."),

    // Vehicle model is required and must be string
    body("inv_model")
    .trim()
    .notEmpty()
    .isLength({ min: 3 })
    .withMessage("Please provide the model of the vehicle."),

    // Vehicle description is required and must be string
    body("inv_description")
    .trim()
    .notEmpty()
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

// Validation rules for editing a review
validate.reviewRules = () => {
  return [
    // Review text validation
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Review text must be at least 10 characters long."),
      // .escape(),

    // Review rating validation
    body("review_rating")
      .isInt({min: 1, max: 5})
      .withMessage("Please select a star rating between 1 and 5.")
  ]
}

// Middleware to check new review data
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_text, review_rating } = req.body;
  const account_id = res.locals.accountData?.account_id;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();

    // Get vehicle details again
    const vehicle = await invModel.getVehicleById(inv_id);
    const grid = await utilities.buildVehicleDetailsGrid(vehicle);

    // Get reviews again
    const reviews = await invModel.getReviewsByInvId(inv_id);

    return res.render("inventory/inventory-detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      grid,
      reviews,
      errors,
      inv_id,
      account_id,
      review_text,
      review_rating,
      loggedin: res.locals.loggedin,
      accountData: res.locals.accountData,
    });
  }

  next();
};


// Middleware to check review validation results
validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_id, review_text, review_rating } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = res.locals.nav;
    const review = await invModel.getReviewById(review_id);

    // Overwrite review_text and review_rating with user input for stickiness
    review.review_text = review_text;
    review.review_rating = review_rating;

    const reviewTitle = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;
    const reviewDate = new Date(review.review_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    return res.render("inventory/edit-review", {
      title: `Edit ${reviewTitle} Review`,
      nav,
      review,
      reviewDate,
      errors,
    });
  }

  next();
};


module.exports = validate
