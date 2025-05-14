// Select the form
const form = document.querySelector(".auth-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    // Select input fields
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const role = document.getElementById("role").value;
    const termsChecked = document.getElementById("terms").checked;
   //email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    //password validation
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("Password must be at least 8 characters long and include both letters and numbers.");
        return;
    }

   //matching passwords  
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    //checking roles 
    if (!role) {
        alert("Please select a role.");
        return;
    }

    // terms checkbox is checked
    if (!termsChecked) {
        alert("You must agree to the terms and privacy policy.");
        return;
    }

    try {
        // existing email check 
        const res = await fetch(`http://localhost:3000/users?email=${email}`);
        const existingUsers = await res.json();

        if (existingUsers.length > 0) {
            alert("This email is already registered. Please log in.");
            return;
        }

        //new user 
        const newUser = {
            name: `${firstName} ${lastName}`,
            email,
            password,
            role,
            isActive: true
        };

        // add the user to json server 
        const createRes = await fetch("http://localhost:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        if (!createRes.ok) {
            throw new Error("Failed to register user.");
        }

        const createdUser = await createRes.json();

        // store user in local storage 
        localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

        /* alert("Account created successfully!"); */
        window.location.href = "login.html";
    } catch (err) {
        console.error("Signup error:", err);
        alert("Something went wrong. Please try again.");
    }
});
