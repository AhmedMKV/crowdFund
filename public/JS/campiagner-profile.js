//checking for user 
const user = JSON.parse(localStorage.getItem("loggedInUser"));
console.log(user);
if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "campaigner") {
  window.location.href = "index.html";
}


  // Logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
    });
  }

//selecting elements 
let name1 = document.getElementById("first-name");
let name2 = document.getElementById("last-name");
let email = document.getElementById("email");
let phone = document.getElementById("phone");

const nameParts = user.name.trim().split(" ");
const firstName = nameParts[0];
const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

name1.textContent = firstName;
name2.textContent = lastName;
email.textContent = user.email;
phone.textContent = user.phone || "no phone number available";

