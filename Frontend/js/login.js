const handlelogin =  () => {
    const userIdInput = document.getElementById('user-id');
    const passwordInput = document.getElementById('password');
    
    const userId = userIdInput.value;
    const password = passwordInput.value;

    const user = {
        userId: userId,
        password: password,
    };

    console.log(user);
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
        console.log("Fetch attempt completed.", data);
    }
};