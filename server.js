const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const port = 5000;

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: "sql12.freesqldatabase.com",
  user: "sql12668817",
  password: "YBtTmUGaLS",
  database: "sql12668817",
  port: 3306,
  timeout: 10000,
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

app.use(cors());
// const createUsersTableQuery = `
//     CREATE TABLE users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       username VARCHAR(255) NOT NULL,
//       email VARCHAR(255) NOT NULL,
//       password VARCHAR(255) NOT NULL
//     );
//   `;

// connection.query(createUsersTableQuery, (error) => {
//   if (error) {
//     console.error("Error creating 'users' table:", error);
//     return;
//   }
//   console.log("table created");
// });

// Define a route to handle saving user data
const checkUserQuery = "SELECT * FROM users WHERE email = ?";
app.post("/saveUserData", express.json(), async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";

  connection.query(checkEmailQuery, [email], async (checkError, results) => {
    if (checkError) {
      console.error("Error checking email uniqueness:", checkError);
      res.status(500).json({ error: "Failed to check email uniqueness" });
    } else if (results.length > 0) {
      // If results.length > 0, the email already exists
      res.status(400).json({ error: "Email already exists" });
    } else {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // If the email is unique, proceed with the insert
        const insertUserDataQuery =
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

        connection.query(
          insertUserDataQuery,
          [username, email, hashedPassword],
          (insertError) => {
            if (insertError) {
              console.error(
                'Error inserting data into "users" table:',
                insertError
              );
              res.status(500).json({ error: "Failed to save user data" });
            } else {
              console.log(
                'Data has been inserted into "users" table successfully'
              );
              res.json({ success: true });
            }
          }
        );
      } catch (hashError) {
        console.error("Error hashing password:", hashError);
        res.status(500).json({ error: "Failed to hash password" });
      }
    }
  });
});

app.delete("/deleteUsersTable", (req, res) => {
  const deleteUsersTableQuery = "DROP TABLE IF EXISTS users";

  connection.query(deleteUsersTableQuery, (error) => {
    if (error) {
      console.error('Error deleting "users" table:', error);
      res.status(500).json({ error: "Failed to delete table" });
    } else {
      console.log('The "users" table has been deleted successfully');
      res.json({ success: true });
    }
  });
});
app.get("/getAllUserData", (req, res) => {
  // Select all data from the 'users' table
  const getAllUserDataQuery = `
    SELECT * FROM users;
  `;

  connection.query(getAllUserDataQuery, (error, results) => {
    if (error) {
      console.error('Error retrieving data from "users" table:', error);
      res.status(500).json({ error: "Failed to retrieve user data" });
    } else {
      console.log('Data has been retrieved from "users" table successfully');
      res.json({ users: results });
    }
  });
});

app.post("/login", express.json(), async (req, res) => {
  const { email, password } = req.body;

  // Query to check if the user with the given email exists
  const checkUserQuery = "SELECT * FROM users WHERE email = ?";

  connection.query(checkUserQuery, [email], async (error, results) => {
    if (error) {
      console.error("Error checking login:", error);
      res.status(500).json({ error: "Failed to check login" });
    } else if (results.length === 1) {
      // If exactly one user is found, verify the password
      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({ success: true, user });
      } else {
        res.status(401).json({ error: "Invalid email or password" });
      }
    } else {
      // If no user or more than one user is found, login failed
      res.status(401).json({ error: "Invalid email or password" });
    }
  });
});
// Route to check if a user with a given email and password exists

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
