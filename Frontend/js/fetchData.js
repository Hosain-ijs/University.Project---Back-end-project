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
});
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

fetchAllPosts();