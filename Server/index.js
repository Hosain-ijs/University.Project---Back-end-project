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

  const getUserInfosql = 'SELECT userId, userName, userImage FROM users WHERE users.userId = ? AND users.userPassword = ?';

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

app.get("/getAllPosts", (req, res) => {
  const sqlForAllPosts = `SELECT posts.postId, users.userName As PosatedUserName, users.userImage As PostedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;

  let query = db .query(sqlForAllPosts, (err, result) => {
    if(err) {
      console.log("Error while fetching all posts: ", err);
      throw err;
    }
    else{
      console.log(result);
      res.send(result);
    }
  });
});

// API to get all comments of a post
app.get('/getAllComments/:postId', (req, res) => {
  let id = req.params.postId;

  let sqlForAllComments = `SELECT users.userName AS commentedUserName, users.userImage AS commentedUserImage, comments.commentId, comments.commentOfPostId, comments.commentText, comments.commentTime
FROM comments
INNER JOIN users ON comments.commentedUserId=users.userId WHERE comments.commentOfPostId = ${id}`;

  let query = db .query(sqlForAllComments, (err, result) => {
    if(err) {
      console.log("Error while fetching comments of post: ", err);
      throw err;
    }
    else{
      res.send(result);
    }
  });
});

// API to post a comment on a post
app.post('/postComment', (req, res) => {
  const {commentOfPostId, commentedUserId, commentText, commentTime} = req.body;
  
  let sqlForPostingComment = `INSERT INTO comments (commentId, commentOfPostId, commentedUserId, commentText, commentTime) VALUES (NULL, ?, ?, ?, ?);
`;

let query = db.query(sqlForPostingComment, [
  commentOfPostId, 
  commentedUserId, 
  commentText,
   commentTime
  ], (err, result) =>{
    if(err){
      console.log("Error adding comment to the database: ", err);
    }
    else{
      res.send(result);
    }
  }
);
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});