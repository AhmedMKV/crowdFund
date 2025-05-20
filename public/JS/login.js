// Spinner control
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

// Check if a user is already logged in
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

// Selecting elements 
const form = document.querySelector(".auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showLoader();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch(`http://localhost:3000/users?email=${email}`);
    const users = await response.json();

    if (users.length === 0) {
      hideLoader();
      return Swal.fire({
        icon: "error",
        title: "Email Not Found",
        text: "No account exists with this email.",
      });
    }

    const user = users[0];

    if (user.password !== password) {
      hideLoader();
      return Swal.fire({
        icon: "error",
        title: "Incorrect Password",
        text: "The password you entered is incorrect.",
      });
    }

    if (!user.isActive) {
      hideLoader();
      return Swal.fire({
        icon: "error",
        title: "Account Blocked",
        text: "This account has been blocked. Please contact support.",
      });
    }

    // Save user and redirect
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    hideLoader();

    Swal.fire({
      icon: "success",
      title: "Login Successful",
      showConfirmButton: false,
      timer: 1200,
    }).then(() => {
      if (user.role === "admin") {
        window.location.href = "../admin.html";
      } else {
        window.location.href = "../index.html";
      }
    });

  } catch (error) {
    console.error("Login failed:", error);
    hideLoader();
    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Something went wrong. Please try again later.",
    });
  }
});
