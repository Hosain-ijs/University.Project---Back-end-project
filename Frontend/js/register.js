const handleRegister = async () => {
    //Get values from inputs
    const userName = document.getElementById('reg-username').value;
    const userPassword = document.getElementById('reg-password').value;
    const userImage = document.getElementById('reg-image').value;

    //Get the error box
    const errorElement = document.getElementById('register-error');
    const errorText = errorElement.querySelector('h3');

    //Simple Validation
    if(!userName || !userPassword || !userImage) {
        errorText.innerText = "Please fill in all fields";
        errorElement.classList.remove('hidden');
        return;
    }

    const newUser = {
        userName: userName,
        userPassword: userPassword,
        userImage: userImage
    };

    //Send to Backend
    try {
        const res = await fetch("http://localhost:5000/register", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(newUser),
        });

        if(res.ok) {
            alert("Registration Successful! Please Login.");
            window.location.href = "index.html";
        } else {
            alert("Registration failed.");
            errorElement.classList.remove('hidden');
        }
    } catch(err) {
        console.error("Error registering user:", err);
        const errorElement = document.getElementById('register-error');
        errorElement.classList.remove('hidden');
    }
};