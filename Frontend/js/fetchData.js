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

    //Get current user ID
    let currentUser = localStorage.getItem("loggedInUser");
    let currentUserId = null;
    if(currentUser) {
        currentUserId = JSON.parse(currentUser).userId;
    }

    allposts.forEach(async post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");

        //Action Buttons logic (Edit/Delete)
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

        //Comments Logic
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

        //New Comment Section (Added like button here)
        const addNewCommetnDiv = document.createElement("div");
        addNewCommetnDiv.classList.add("new-comment-section");
        
        addNewCommetnDiv.innerHTML = `
            <div class="like-section-inline">
                <button class="action-btn like-btn" onclick="handleLike(${post.postId})">
                    ❤️ <span id="like-count-${post.postId}">0</span>
                </button>
            </div>

            <div class="new-comment-input">
                <input type="text" placeholder="Add a comment..." class="new-comment-textbox" id="new-comment-textbox-for-postId-${post.postId}">
            </div>
            
            <div class="new-comment-button">
                <button onclick="handlePostComment(${post.postId})" class="new-comment-submit-button">Comment</button>
            </div>
        `;
        postDiv.appendChild(addNewCommetnDiv);

        //Fetch Like Count (Moved to end so the element exists)
        fetchLikeCount(post.postId);
    });
};

const handlePostComment = async (postId) => {

    //Collecting logged in user info from local storage
    let user = localStorage.getItem("loggedInUser");
    if(user){
        user = JSON.parse(user);
    }
    const commentedUserId = user.userId;

    //Collecting comment text from input box
    const commentInputBox = document.getElementById(`new-comment-textbox-for-postId-${postId}`);

    const commentText = commentInputBox.value;

    //Current time of the comment
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
   //Geting user id from local storage
    let user = localStorage.getItem("loggedInUser");
    if(user){
        user = JSON.parse(user);
    }
    const postedUserId = user.userId;

    //Current time of the post
    let now = new Date();

    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    let timeOfPost = now.toISOString();

    //Post text
    const postTextElement = document.getElementById('newPost-text');
    const postText = postTextElement.value;

    //post image
    const postImageElement = document.getElementById('newPost-image');
    const postImageUrl = postImageElement.value;

    //Creating a post object
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
    document.getElementById('delete-modal').classList.remove('hidden');
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
    
    document.getElementById('edit-post-text').value = currentText;
    document.getElementById('edit-post-image').value = currentImage;
    document.getElementById('edit-modal').classList.remove('hidden');
};

//Triggered when click "Save Changes" inside the modal
const submitEditPost = async () => {
    if (!postIdToEdit) return;

    const newText = document.getElementById('edit-post-text').value;
    const newImage = document.getElementById('edit-post-image').value;
    
    const updateData = { 
        postId: postIdToEdit, 
        postText: newText,
        postImageUrl: newImage
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

//Function to handle clicking the Like button
const handleLike = async (postId) => {
    let user = localStorage.getItem("loggedInUser");
    if(user){
        user = JSON.parse(user);
    }
    const likedUserId = user.userId;

    const likeData = { likedPostId: postId, likedUserId: likedUserId };

    try {
        await fetch("http://localhost:5000/toggleLike", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(likeData)
        });
        fetchLikeCount(postId);
    } catch (err) {
        console.log("Error liking post:", err);
    }
};

// Function to get the number of likes
const fetchLikeCount = async (postId) => {
    try {
        const res = await fetch(`http://localhost:5000/getLikeCount/${postId}`);
        const data = await res.json();
        const countSpan = document.getElementById(`like-count-${postId}`);
        if(countSpan) {
            countSpan.innerText = data[0].count;
        }
    } catch (err) {
        console.log("Error fetching likes:", err);
    }
};

//This functions get called automatically whenever the script (fetchData) is loaded in the HTML page
fetchAllPosts();
checkLoggedInUser();
showLoggedUsename();