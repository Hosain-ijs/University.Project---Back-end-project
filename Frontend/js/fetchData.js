const showLoggedUsename = () => {
    const userNameElement = document.getElementById('logged-username');

    //find username from localstorage
    let user = localStorage.getItem('loggedInUser');
    if(user){
        user = JSON.parse(user);
    }

    //show username in the webpage
    userNameElement.innerText = user.userName;
};

const checkLoggedInUser = () =>{
    let user = localStorage.getItem('loggedInUser');
    if(user){
        user = JSON.parse(user);
    }
    else{
        window.location.href = "/index.html";
    }
}

const logout = () => {
    //clearing the localstorage
    localStorage.clear();
    checkLoggedInUser();
}

const fetchAllPosts = async () => {
    let data;

    try {
        const res = await fetch("http://localhost:5000/getAllPosts");
        data = await res.json();
        console.log(data);
        showAllPosts(data);
    }
    catch(err){
        console.log("Error fetching all posts:");
    }
};

const showAllPosts = (allposts) => {
    const postsContainer = document.getElementById("post-container");
    postsContainer.innerHTML = "";

    allposts.forEach(async post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        postDiv.innerHTML = `
        <div class = "post-header">
            <div class = "post-user-image">
                <img src="${post.PostedUserImage}" alt="User Image">
            </div>

            <div class = "post-username-time">
                <p class="post-username">${post.PosatedUserName}</p>
                <div class = "post-time">
                    <span>${post.postedTime}</span>
                    <span>hours ago</span>
                </div>
            </div>
        </div>

        <div class = "post-text">
            <p class = "post-text-content">
               ${post.postText}
            </p>
        </div>

        <div class = "post-image">
            <img src="${post.postImageUrl}" alt="Post Image">
        </div>       
        `;

        postsContainer.appendChild(postDiv);

        // comments unedr a post

        let postComments = await fetchAllCommentsOfAPost(post.postId);
        console.log("postComments: ", postComments);

        postComments.forEach((comment) => {
            const commentsHolderDiv = document.createElement("div");
            commentsHolderDiv.classList.add("comment-holder");

            commentsHolderDiv.innerHTML = `
        <div class = "comment">
                <div class = "comment-user-image">
                    <img src=${comment.commentedUserImage} alt="Comment User Image">

                </div>

                <div class = "comment-text-container">
                    <h4>${comment.commentedUserName}</h4>
                    <p class = "comment-text">
                    ${comment.commentText}
                    </p>
            </div>
        </div>
        `;

        postDiv.appendChild(commentsHolderDiv);
    });

    // adding a new comment to the post

    const addNewCommetnDiv = document.createElement("div");
    addNewCommetnDiv.classList.add("new-comment-section");

    addNewCommetnDiv.innerHTML = `
            <div class = "new-comment-input">
                <input 
                type="text" 
                placeholder="Add a comment..." 
                class = "new-comment-textbox" 
                id = "new-comment-textbox-for-postId-${post.postId}">
            </div>
            <div class = "new-comment-button">
                <button onClick = handlePostComment(${post.postId}) class = "new-comment-submit-button" id = "new-comment-submit-button-for-postId1">Comment</button>

            </div>
    `

    postDiv.appendChild(addNewCommetnDiv);
});
};

const handlePostComment = async (postId) => {

    // collecting logged in user info from local storage
    let user = localStorage.getItem("loggedInUser");
    if(user){
        user = JSON.parse(user);
    }
    const commentedUserId = user.userId;

    // collecting comment text from input box
    const commentInputBox = document.getElementById(`new-comment-textbox-for-postId-${postId}`);

    const commentText = commentInputBox.value;

    //current time of the comment

    let now = new Date();

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    let timeofComment = now. toISOString();
    
    const commentObject = {
        commentOfPostId: postId,
        commentedUserId: commentedUserId,
        commentText: commentText,
        commentTime: timeofComment,
    };

    try{
        const res = await fetch("http://localhost:5000/postComment", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(commentObject),
        });
        const data = await res.json();
        console.log("Comment posted successfully: ", data);
    }
    catch(err){
        console.log("Error while posting comment to the server: ", err);
}
finally{
    location.reload();
}
};

const fetchAllCommentsOfAPost = async (postId) => {
    let commentsOfPost = [];
    try {
        const res = await fetch(`http://localhost:5000/getAllComments/${postId}`);
        commentsOfPost = await res.json();
        console.log(commentsOfPost);
    }
    catch(err){
        console.log("Error fetching comments from the server: ", err);
    }
    finally{
        return commentsOfPost;
    }
}

//This function automatically runs
fetchAllPosts();
checkLoggedInUser();
showLoggedUsename();