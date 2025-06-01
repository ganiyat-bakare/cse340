const pool = require("../database/")

/* ***************************
* Get all classification data
* *************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
* Get all inventory items and classification_name by classification_id
* *************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i JOIN public.classification AS c ON i.classification_id = c.classification_id 
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationbyid error " + error)
    }    
}

/* ***************************
* Get vehicle by id 
* *************************** */
async function getVehicleById(inv_id) {
    try {
        const data = await pool.query(
           `SELECT i.*, c.classification_name FROM public.inventory AS i
            JOIN public.classification AS c ON i.classification_id = c.classification_id
            WHERE i.inv_id = $1`,
            [inv_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getVehicleById error " + error)
    }
}

async function addClassification(classification_name) {  
  const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *'  
  try {  
    const result = await pool.query(sql, [classification_name])  
    return result.rows[0]  
  } catch (err) {  
    console.error(err)  
    return null  
  }  
}  

async function addInventory(classification_id, make, model, description, image, thumbnail, price, year, miles, color) {
  try {
    const sql = `
      INSERT INTO inventory (
        classification_id, inv_make, inv_model,
        inv_description, inv_image, inv_thumbnail,
        inv_price, inv_year, inv_miles, inv_color
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const data = await pool.query(sql, [
      classification_id, make, model, description,
      image, thumbnail, price, year, miles, color
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("addInventory error: " + error);
    return null;
  }
}

module.exports = {
    getClassifications, 
    getInventoryByClassificationId, 
    getVehicleById, 
    addClassification, 
    addInventory,
};
