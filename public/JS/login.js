// Check if a user is already logged in
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (loggedInUser) {
  alert("You are already logged in!");

  if (loggedInUser.role === "admin") {
    window.location.href = "../admin.html";
  } else {
    window.location.href = "../index.html";
  }
}


//selecting elements 
const form = document.querySelector(".auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const response = await fetch(`http://localhost:3000/users?email=${email}`);
    const users = await response.json();
    if (users.length === 0) {
      alert("no account with this email");
      return;
    }
    const user = users[0];

    if (user.password !== password) {
      alert("incorrect password");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
/*     console.log(localStorage.getItem("loggedInUser")); */
    

    if (user.role === "admin") {
      window.location.href = "../admin.html";
    } else {
      window.location.href = "../index.html";
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Something went wrong. Please try again later.");
  }
});
