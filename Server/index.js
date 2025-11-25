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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});