const invModel = require("../models/inventory-model")
const util = {}

/* ************************
* Constructs the nav HTML unordered list
* ************************* */
util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ************************************
* Build the classification view HTML
* ********************************** */
util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************************
* Build the vehicle details view HTML
* ********************************** */
util.buildVehicleDetailsGrid = async function(vehicle) {
  return `
    <section class="vehicle-detail-grid">
      <div class="vehicle-image-wrapper">
        <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <img class="vehicle-image" src="${vehicle.inv_image}" alt="Full image of ${vehicle.inv_make} ${vehicle.inv_model}">
      </div>
      <div class="vehicle-info">
        <h3>${vehicle.inv_make} ${vehicle.inv_model} Details</h3>
        <p><strong>Price: <span class="price highlight">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span></strong></p>
        <p><strong>Description:</strong> <span class="description">${vehicle.inv_description}</span></p>
        <p><strong>Color:</strong> <span class="highlight"> ${vehicle.inv_color}</span></p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
      </div>
    </section>
  `;
}


/* ************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 * ********************************** */
util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = util
