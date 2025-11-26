const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const port = 5000;

const app = express();

// Middlewares

app.use(cors());
app.use(express.json());

// MySQL Connection

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'postbook'
});

db.connect((err) => {
  if(err) {
    console.log("Something went wrong while connecting to the database: ",err);
    throw err;
  }
  else{
    console.log("MySQL server connected...");
  }
});

// getting user data from server

app.post('/getUserInfo', (req, res) => {

  const { userId, password } = req.body;

  const getUserInfosql = 'SELECT userid, userName, userImage FROM users WHERE users.userId = ? AND users.userPassword = ?';

  let query = db .query(getUserInfosql, [userId, password], (err, result) => {
    if(err) {
      console.log("Error while fetching user data: ", err);
      throw err;
    }
    else{
      console.log("User data fetched successfully");
      res.send(result);
    }
  });
});

// Starting the server

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});