const invModel = require("../models/inventory-model")  
const { validationResult } = require("express-validator")  
const utilities = require("../utilities/")  

const invCont = {}  

/* ****************************************  
 *  Build inventory by classification view  
 * ************************************** */  
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
  accountId = req.session.account_id 
  try {  
    const vehicleData = await invModel.getVehicleById(invId) 
    const reviews = await invModel.getReviewsByInvId(invId) 
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
      reviews, 
      accountId,
      inv_id: invId,
      errors: null,  
    })  
  } catch (err) {  
    next(err)  
  }  
}  

invCont.addItemReview = async function (req, res, next) {
  const { inv_id, review_text, review_rating} = req.body
  const account_id = res.locals.accountData?.account_id
  try {
    if (!account_id) {
      // If user is not logged in, redirect to login page with notice
      req.flash("notice", "You must be logged in to add a review.")
       return res.redirect("/account/login")
    }

    const result = await invModel.addItemReview(inv_id, account_id, review_text, review_rating);

    if (!result) {
      req.flash("notice", "Failed to add review.");
    }

    res.redirect(`/inv/detail/${inv_id}`);
  } catch (err) {
    console.error("Error adding review:", err);
    req.flash("notice", "An error occurred while adding your review.");
    res.redirect(`/inv/detail/${inv_id}`);
  }
}

/* ***************************  
 *  Build management view  
 * ************************** */  
invCont.buildManagement = async function (req, res, next) {  
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList() 
  res.render("inventory/management", {  
    title: "Vehicle Management",  
    nav,  
    errors: null,  
    classificationList,
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
      res.status(500).render("./inventory/add-classification", {  
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
    // classificationList,
    nav,
    errors: null,
    classificationList,
  })
}


/* ************************************  
 *  Handle the add new inventory  view
 * ********************************** */  
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
    req.flash("notice", `${inv_make} ${inv_model} was successfully added.`);
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventory = async function(req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getVehicleById(inv_id);
  const classificationList = await utilities.buildClassificationList(itemData.classification_id);
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList,
    errors: null,
    inv_id: itemData.inv_id,
    classification_id: itemData.classification_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_year: itemData.inv_year,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color
  })
}

/* ***************************  
 *  Handle inventory Data Update  
 * ************************** */  
invCont.updateInventory = async function(req, res, next) {  
  let nav = await utilities.getNav()
  const {  
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
  } = req.body;  

  const updateResult = await invModel.updateInventory({  
    inv_id: parseInt(inv_id),  
    classification_id: parseInt(classification_id),  
    inv_make,  
    inv_model,  
    inv_description,  
    inv_image,  
    inv_thumbnail,  
    inv_price,  
    inv_year,  
    inv_miles,  
    inv_color  
  });  

  if (updateResult) {  
    req.flash("notice", `${inv_make} ${inv_model} was successfully updated.`);  
    res.redirect("/inv");  
  } else {  
    // On failure, re-render form with current data  
    const classificationList = await utilities.buildClassificationList(classification_id);  
    res.render("./inventory/edit-inventory", {  
      title: "Edit " + inv_make + " " + inv_model,  
      nav,  
      classificationList,  
      errors: [{ msg: "Failed to update vehicle." }],  
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
  }
}

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
invCont.deleteConfirmation = async function(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("inventory/delete-confirm", {
    title: "Delete" + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_price: itemData.inv_price,
    inv_year: itemData.inv_year
  })
}

/* ***************************
 *  Process Inventory Deletion
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  try {
    const result = await invModel.deleteInventoryItem(inv_id)
    if (result.rowCount > 0) {
      req.flash("notice", "Vehicle successfully deleted.")
      res.redirect("/inv")
    } else {
      req.flash("notice", "Vehicle deletion failed.")
      res.redirect(`/inv/delete/${inv_id}`)
    }
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build edit review view     
* ************************** */
invCont.buildEditReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  const review = await invModel.getReviewById(reviewId);

  if (!review) {
    req.flash("notice", "Review not found.");
    return res.redirect("/account/management");
  }

  const reviewTitle = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;
  const reviewDate = new Date(review.review_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountId = res.locals?.accountData?.account_id;
  if (review.account_id !== accountId) {
    req.flash("notice", "Unauthorized access to edit review.");
    return res.redirect("/account/management");
  }

  let nav = await utilities.getNav();
  res.render("inventory/edit-review", {
    title: "Edit " + reviewTitle + " Review",
    review,
    reviewDate,
    nav,
    errors: null,
  });
}

/* ***************************
 *  Handle Review Update       
* ************************** */
invCont.updateReview = async function (req, res, next) {
  const reviewId = parseInt(req.body.review_id);
  const reviewText = req.body.review_text;
  const reviewRating = parseInt(req.body.review_rating)
  const accountId = res.locals?.accountData?.account_id;
  
  const review = await invModel.getReviewById(reviewId);
  if (!review) {
    return res.redirect("/account/");
  }

  // Check ownership
  if (review.account_id !== accountId) {
    return res.redirect("/account/");
  }

  // Proceed to update
  await invModel.updateReview(reviewId, reviewText, reviewRating);
  req.flash("message", "Review updated successfully.");
  res.redirect("/account/");
}

/* ***************************
 *  Build delete review view     
 * ************************** */
invCont.buildDeleteReview = async function (req, res, next) {
  const reviewId = parseInt(req.params.reviewId);
  const review = await invModel.getReviewById(reviewId);

  if (!review) {
    req.flash("notice", "Review not found.");
    return res.redirect("/account/management");
  }

  const reviewTitle = `${review.inv_year} ${review.inv_make} ${review.inv_model}`;
  const reviewDate = new Date(review.review_date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const accountId = res.locals?.accountData?.account_id;
  if (review.account_id !== accountId) {
    req.flash("notice", "Unauthorized access to delete review.");
    return res.redirect("/account/management");
  }

  let nav = await utilities.getNav();
  res.render("inventory/delete-review", {
    title: "Delete " + reviewTitle + " Review",
    review,
    reviewDate,
    nav,
    errors: null,
  });
}

/* ***************************
 *  Process Review Deletion
 * ************************** */
invCont.deleteReview = async function (req, res, next) {
  const reviewId = parseInt(req.body.review_id);
  const review = await invModel.getReviewById(reviewId);

  if (!review) {
    req.flash("notice", "Review not found.");
    return res.redirect("/account/");
  }

  const accountId = res.locals?.accountData?.account_id;
  if (review.account_id !== accountId) {
    req.flash("notice", "Unauthorized to delete this review.");
    return res.redirect("/account/");
  }

  await invModel.deleteReview(reviewId);
  req.flash("message", "Review deleted successfully");
  res.redirect("/account/");
}


module.exports = invCont
