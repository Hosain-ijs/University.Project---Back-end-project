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

    // 1. Get current user ID
    let currentUser = localStorage.getItem("loggedInUser");
    let currentUserId = null;
    if(currentUser) {
        currentUserId = parseInt(JSON.parse(currentUser).userId);
    }

    allposts.forEach(async post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        // 2. Create Action Buttons ONLY if user owns the post
        let actionButtons = "";
        if (currentUserId == post.postedUserId) {
            actionButtons = `
                <div class="post-actions-menu">
                    <button class="action-btn edit-btn" onclick="handleEditPost(${post.postId}, '${post.postText}', '${post.postImageUrl}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="handleDeletePost(${post.postId})">Delete</button>
                </div>
            `;
        }

        postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-header-left">
                <div class="post-user-image">
                    <img src="${post.PostedUserImage}" alt="User Image">
                </div>
                <div class="post-username-time">
                    <p class="post-username">${post.PosatedUserName}</p>
                    <div class="post-time">
                        <span>${timeDifference(post.postedTime)}</span>
                    </div>
                </div>
            </div>
            
            <div class="post-header-right">
                ${actionButtons}
            </div>
        </div>

        <div class="post-text">
            <p class="post-text-content">${post.postText}</p>
        </div>

        <div class="post-image">
            <img src="${post.postImageUrl}" alt="Post Image">
        </div>       
        `;

        postsContainer.appendChild(postDiv);

        // --- COMMENT SECTION LOGIC (Copy this back if you deleted it) ---
        let postComments = await fetchAllCommentsOfAPost(post.postId);
        const commentsHolderDiv = document.createElement("div");
        commentsHolderDiv.classList.add("comment-holder");

        postComments.forEach((comment) => {
            const singleCommentDiv = document.createElement("div");
            singleCommentDiv.classList.add("comment");
            singleCommentDiv.innerHTML = `
                <div class="comment-user-image">
                    <img src="${comment.commentedUserImage}" alt="Comment User Image">
                </div>
                <div class="comment-text-container">
                    <h4>${comment.commentedUserName}</h4>
                    <p class="comment-text">${comment.commentText}</p>
                </div>
            `;
            commentsHolderDiv.appendChild(singleCommentDiv);
        });
        postDiv.appendChild(commentsHolderDiv);

        const addNewCommetnDiv = document.createElement("div");
        addNewCommetnDiv.classList.add("new-comment-section");
        addNewCommetnDiv.innerHTML = `
            <div class="new-comment-input">
                <input type="text" placeholder="Add a comment..." class="new-comment-textbox" id="new-comment-textbox-for-postId-${post.postId}">
            </div>
            <div class="new-comment-button">
                <button onclick="handlePostComment(${post.postId})" class="new-comment-submit-button">Comment</button>
            </div>
        `;
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
    
    let timeOfComment = now.toISOString();
    
    const commentObject = {
        commentOfPostId: postId,
        commentedUserId: commentedUserId,
        commentText: commentText,
        commentTime: timeOfComment,
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

const handleAddNewPost = async () => {
   //geting user id from local storage
    let user = localStorage.getItem("loggedInUser");
    if(user){
        user = JSON.parse(user);
    }
    const postedUserId = user.userId;

    //current time of the post
    let now = new Date();

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    let timeOfPost = now.toISOString();

    //post text
    const postTextElement = document.getElementById('newPost-text');
    const postText = postTextElement.value;

    //post image
    const postImageElement = document.getElementById('newPost-image');
    const postImageUrl = postImageElement.value;

    //creating a post object
    const postObject = {
        postedUserId : postedUserId,
        postedTime : timeOfPost,
        postText : postText,
        postImageUrl : postImageUrl,
    };

        try{
        const res = await fetch("http://localhost:5000/addNewPost", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(postObject),
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

let postIdToDelete = null;
let postIdToEdit = null;

const closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
};

//Triggered when click "Delete" on the post
const handleDeletePost = (postId) => {
    postIdToDelete = postId;
    document.getElementById('delete-modal').classList.remove('hidden'); // Show Modal
};

//Triggered when click "Yes, Delete" inside the modal
const submitDeletePost = async () => {
    if (!postIdToDelete) return;

    try {
        await fetch(`http://localhost:5000/deletePost/${postIdToDelete}`, { method: 'DELETE' });
        location.reload();
    } catch (err) {
        console.log(err);
    }
};

//Triggered when click "Edit" on the post
const handleEditPost = (postId, currentText, currentImage) => {
    postIdToEdit = postId; 
    
    // Fill the text box
    document.getElementById('edit-post-text').value = currentText;
    
    // NEW: Fill the image URL box
    document.getElementById('edit-post-image').value = currentImage;
    
    document.getElementById('edit-modal').classList.remove('hidden');
};

//Triggered when click "Save Changes" inside the modal
const submitEditPost = async () => {
    if (!postIdToEdit) return;

    // Get values from BOTH inputs
    const newText = document.getElementById('edit-post-text').value;
    const newImage = document.getElementById('edit-post-image').value;
    
    const updateData = { 
        postId: postIdToEdit, 
        postText: newText,
        postImageUrl: newImage // NEW: Send the image URL
    };

    try {
        await fetch(`http://localhost:5000/editPost`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        location.reload();
    } catch (err) {
        console.log(err);
    }
};

//This functions get called automatically whenever the script (fetchData) is loaded in the HTML page
fetchAllPosts();
checkLoggedInUser();
showLoggedUsename();