// Helper functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedInUser) {
  Swal.fire({
    icon: "info",
    title: "Already Logged In",
    text: "You are already logged in!",
    confirmButtonText: "Continue",
  }).then(() => {
    if (loggedInUser.role === "admin") {
      window.location.href = "../admin.html";
    } else {
      window.location.href = "../index.html";
    }
  });
}

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

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return Swal.fire({
      icon: "error",
      title: "Invalid Email",
      text: "Please enter a valid email address."
    });
  }

  // Password validation
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordPattern.test(password)) {
    return Swal.fire({
      icon: "warning",
      title: "Weak Password",
      text: "Password must be at least 8 characters long and include both letters and numbers."
    });
  }

  // Matching passwords
  if (password !== confirmPassword) {
    return Swal.fire({
      icon: "error",
      title: "Password Mismatch",
      text: "Passwords do not match."
    });
  }

  // Role check
  if (!role) {
    return Swal.fire({
      icon: "info",
      title: "Missing Role",
      text: "Please select a role."
    });
  }

  // Terms checkbox
  if (!termsChecked) {
    return Swal.fire({
      icon: "warning",
      title: "Terms Required",
      text: "You must agree to the terms and privacy policy."
    });
  }

  showLoader();

  try {
    // Check if email already exists
    const res = await fetch(`http://localhost:3000/users?email=${email}`);
    const existingUsers = await res.json();

    if (existingUsers.length > 0) {
      hideLoader();
      return Swal.fire({
        icon: "error",
        title: "Email Already Registered",
        text: "This email is already registered. Please log in."
      });
    }

    // New user object
    const newUser = {
      name: `${firstName} ${lastName}`,
      email,
      password,
      role,
      isActive: true,
      pledgedCampaigns: []
    };

    // Add user to JSON Server
    const createRes = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser)
    });

    if (!createRes.ok) {
      throw new Error("Failed to register user.");
    }

    const createdUser = await createRes.json();
    localStorage.setItem("loggedInUser", JSON.stringify(createdUser));

    hideLoader();

    Swal.fire({
      icon: "success",
      title: "Account Created",
      text: "Your account has been successfully created!",
      confirmButtonText: "Log In"
    }).then(() => {
      window.location.href = "login.html";
    });

  } catch (err) {
    hideLoader();
    console.error("Signup error:", err);
    Swal.fire({
      icon: "error",
      title: "Signup Failed",
      text: "Something went wrong. Please try again."
    });
  }
});
