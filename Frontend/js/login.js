const handlelogin =  async() => {
    const userIdInput = document.getElementById('user-id');
    const passwordInput = document.getElementById('password');
    
    const userId = userIdInput.value;
    const password = passwordInput.value;

    const user = {
        userId: userId,
        password: password,
    };

    const userInfo = await fetchUserInfo(user);
    console.log(userInfo);
    const errorElement = document.getElementById('user-login-error');

    // show error message if userInfo did not match
    if(!userInfo || userInfo.length === 0){
        errorElement.classList.remove('hidden');
    }
    else{
        errorElement.classList.add('hidden');

        // store logged in user info in local storage before redirecting to post.html
        localStorage.setItem("loggedInUser", JSON.stringify(userInfo[0]));

        // redirect to post.html
        window.location.href = "post.html";
    }
};

const fetchUserInfo = async(user) => {
    let data;
    try{
        const res = await fetch("http://localhost:5000/getUserInfo", {
        method: "POST",
        headers: {
           "content-type": "application/json",
        },
        body: JSON.stringify(user),
        });
        data = await res.json();
    }

    catch(err){
        console.error("Error fetching user info:", err);
    }

    finally{
        return data;
    }
};