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

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory({ inv_id, classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color }) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        classification_id = $2,
        inv_make = $3,
        inv_model = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_price = $8,
        inv_year = $9,
        inv_miles = $10,
        inv_color = $11
      WHERE inv_id = $1
      RETURNING *;
    `;
    const data = await pool.query(sql, [
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
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    return null;
  }
}

/* ***************************
 *  Delete inventory item by ID
 * ************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    console.error("Delete Inventory Error", error)
    return null
  }
}

async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.review_text, r.review_date, review_rating,
             a.account_firstname, a.account_lastname
      FROM review r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews:", error);
    return [];
  }
}

async function addItemReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = `
      INSERT INTO review (inv_id, account_id, review_text, review_rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text, review_rating]);
    return result.rows[0];
  } catch (error) {
    console.error("Error adding review:", error);
    return null;
  }
}

async function getReviewsByAccountId(account_id) {
  const sql = `
    SELECT r.review_id, r.review_text, r.review_date, r.review_rating, 
           i.inv_make, i.inv_model, i.inv_year
    FROM review r
    JOIN inventory i ON r.inv_id = i.inv_id
    WHERE r.account_id = $1
    ORDER BY r.review_date DESC;
  `
  const result = await pool.query(sql, [account_id])
  return result.rows
}


async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_text, r.review_date, r.review_rating, 
           r.inv_id, r.account_id, i.inv_make, i.inv_model, i.inv_year
    FROM review r
    JOIN inventory i ON r.inv_id = i.inv_id
    WHERE r.review_id = $1;
    `;
    const result = await pool.query(sql, [review_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getReviewById error:", error);
  }
}

async function updateReview(review_id, review_text, review_rating) {
  try {
    const sql = `UPDATE review SET review_text = $1, review_rating = $2 WHERE review_id = $3`;
    const result = await pool.query(sql, [review_text, review_rating, review_id]);
    return result.rowCount;
  } catch (error) {
    console.error("updateReview error:", error)
  }
}

async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM review WHERE review_id = $1`;
    const result = await pool.query(sql, [review_id]);
    return result.rowCount;
  } catch (error) {
    console.error("deleteReview error:", error)
  }
}

module.exports = {
    getClassifications, 
    getInventoryByClassificationId, 
    getVehicleById, 
    addClassification, 
    addInventory,
    updateInventory,
    deleteInventoryItem,
    getReviewsByInvId,
    addItemReview,
    getReviewsByAccountId,
    getReviewById,
    updateReview,
    deleteReview
}
