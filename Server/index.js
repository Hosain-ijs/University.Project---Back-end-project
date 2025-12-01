const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const port = 5000;

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MySQL Connection
let db = mysql.createConnection({
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

//Getting user data from server
app.post('/getUserInfo', (req, res) => {

  const { userId, password } = req.body;

  const getUserInfosql = 'SELECT userId, userName, userImage FROM users WHERE users.userId = ? AND users.userPassword = ?';
  
  let query = db .query(getUserInfosql, [userId, password], (err, result) => {
    if(err) {
      console.log("Error while fetching user data: ", err);
      res.send([]);
    }
    else{
      console.log("User data fetched successfully");
      res.send(result);
    }
  });
});

app.get("/getAllPosts", (req, res) => {
  
  const sqlForAllPosts = `SELECT posts.postedUserId, posts.postId, users.userName As PosatedUserName, users.userImage As PostedUserImage, posts.postedTime, posts.postText, posts.postImageUrl FROM posts INNER JOIN users ON posts.postedUserId=users.userId ORDER BY posts.postedTime DESC`;
  
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

//API to get all comments of a post
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

//Addding a new post
app.post('/addNewPost', (req, res) => {

  const {postedUserId, postedTime, postText, postImageUrl} = req.body;

  let sqlForAddingNewPost = `INSERT INTO posts (postId, postedUserId, postedTime, postText, postImageUrl) VALUES (NULL, ?, ?, ?, ?)`;

  let query = db.query(sqlForAddingNewPost, [postedUserId, postedTime, postText, postImageUrl], (err, result) => {
    if(err){
      console.log("Error while addding a new post in database: ", err);
      throw err;
    }
    else{
      res.send(result);
    }
  });
});

//Register New User
app.post('/register', (req, res) => {
    const { userName, userPassword, userImage } = req.body;

    const sqlRegister = "INSERT INTO users (userId, userName, userPassword, userImage) VALUES (NULL, ?, ?, ?)";

    db.query(sqlRegister, [userName, userPassword, userImage], (err, result) => {
        if(err) {
            console.log("Error registering user: ", err);
            res.status(500).send({ message: "Error registering user" });
        } else {
            console.log("User registered successfully");
            res.send({ message: "Registration successful" });
        }
    });
});

// API to Delete a Post
app.delete('/deletePost/:postId', (req, res) => {
    const id = req.params.postId;
    const sqlDelete = "DELETE FROM posts WHERE postId = ?";
    db.query(sqlDelete, [id], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error deleting post");
        } else {
            res.send("Post deleted");
        }
    });
});

// API to Edit a Post (Text AND Image)
app.put('/editPost', (req, res) => {
    const { postId, postText, postImageUrl } = req.body;
    
    const sqlUpdate = "UPDATE posts SET postText = ?, postImageUrl = ? WHERE postId = ?";
    
    db.query(sqlUpdate, [postText, postImageUrl, postId], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error updating post");
        } else {
            res.send("Post updated");
        }
    });
});

// API to Toggle Like (Add or Remove)
app.post('/toggleLike', (req, res) => {
    const { likedPostId, likedUserId } = req.body;

    const sqlCheck = "SELECT * FROM likes WHERE likedPostId = ? AND likedUserId = ?";
    
    db.query(sqlCheck, [likedPostId, likedUserId], (err, result) => {
        if (err) {
            console.log(err);
            res.send({ error: "Error" });
        }
        else if (result.length > 0) {
            const sqlDelete = "DELETE FROM likes WHERE likedPostId = ? AND likedUserId = ?";
            db.query(sqlDelete, [likedPostId, likedUserId], (err, result) => {
                res.send({ status: "unliked" });
            });
        } 
        else {
            const sqlInsert = "INSERT INTO likes (likeId, likedPostId, likedUserId) VALUES (NULL, ?, ?)";
            db.query(sqlInsert, [likedPostId, likedUserId], (err, result) => {
                res.send({ status: "liked" });
            });
        }
    });
});

// API to Get Like Count
app.get('/getLikeCount/:postId', (req, res) => {
    const postId = req.params.postId;
    const sqlCount = "SELECT COUNT(*) AS count FROM likes WHERE likedPostId = ?";
    
    db.query(sqlCount, [postId], (err, result) => {
        if (err) console.log(err);
        else res.send(result);
    });
});

// Starting the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});