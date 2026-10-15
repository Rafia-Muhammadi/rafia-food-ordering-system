const express = require("express");
const mysql = require("mysql8");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public")); // Read HTML/CSS from public folder

// Connection establishment with MySQL 8
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "DB_PASSWORD", // CHANGE THIS
    database: "food_system" // Ensure this database is created in MySQL
});

db.connect((err) => {
    if (err) throw err;
    console.log("Connected to MySQL Database");
    
    // Auto-create table if it doesn't exist (with image_url column)
    db.query(`CREATE TABLE IF NOT EXISTS food_items (
        food_id INT AUTO_INCREMENT PRIMARY KEY,
        food_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        availability BOOLEAN DEFAULT TRUE
    )`);
});

// GET ALL FOODS (For Admin Dashboard and Customer Menu)
app.get("/foods", (req, res) => {
    db.query("SELECT * FROM food_items", (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.json(result);
    });
});

// GET ONE FOOD (For populating the Edit form)
app.get("/foods/:id", (req, res) => {
    db.query("SELECT * FROM food_items WHERE food_id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        res.json(result);
    });
});

// INSERT NEW FOOD
app.post("/foods", (req, res) => {
    const { food_name, category, price, description, availability, image_url } = req.body;
    db.query(
        "INSERT INTO food_items (food_name, category, price, description, availability, image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [food_name, category, price, description, availability, image_url],
        (err) => {
            if (err) return res.status(500).send(err.message);
            res.send("Food Item Inserted Successfully");
        }
    );
});

// UPDATE FOOD
app.put("/foods/:id", (req, res) => {
    const { food_name, category, price, description, availability, image_url } = req.body;
    db.query(
        "UPDATE food_items SET food_name=?, category=?, price=?, description=?, availability=?, image_url=? WHERE food_id=?",
        [food_name, category, price, description, availability, image_url, req.params.id],
        (err, result) => {
            if (err) return res.status(500).send(err.message);
            if (result.affectedRows == 0) return res.status(404).send("Food NOT found");
            res.send("Food Updated Successfully");
        }
    );
});

// DELETE FOOD
app.delete("/foods/:id", (req, res) => {
    db.query("DELETE FROM food_items WHERE food_id=?", [req.params.id], (err, result) => {
        if (err) return res.status(500).send(err.message);
        if (result.affectedRows == 0) return res.status(404).send("Food NOT found to delete");
        res.send("Food Deleted Successfully");
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});