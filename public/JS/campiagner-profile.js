// Loader functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

// Get stored user for ID only
const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!storedUser) {
  Swal.fire({
    icon: "warning",
    title: "Unauthorized",
    text: "You must log in first.",
    confirmButtonText: "Go to Login"
  }).then(() => {
    window.location.href = "login.html";
  });
} else {
  showLoader();

  fetch(`http://localhost:3000/users/${storedUser.id}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    })
    .then((user) => {
      hideLoader();

      if (user.role !== "campaigner") {
        return Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only campaigners can access this page.",
          confirmButtonText: "Back to Home"
        }).then(() => {
          window.location.href = "index.html";
        });
      }

      // Load user data into profile
      
        const name1 = document.getElementById("first-name");
        const name2 = document.getElementById("last-name");
        const email = document.getElementById("email");
        const role = document.getElementById("phone");
        const bio = document.getElementById("bio");

        const nameParts = user.name.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        name1.textContent = firstName;
        name2.textContent = lastName;
        email.textContent = user.email;
        role.textContent = user.role;
        bio.textContent = user.createdCampaigns.length;
    

      // Logout logic
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          Swal.fire({
            title: "Are you sure you want to logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel"
          }).then((result) => {
            if (result.isConfirmed) {
              localStorage.removeItem("loggedInUser");
              Swal.fire({
                icon: "success",
                title: "Logged out",
                showConfirmButton: false,
                timer: 1200
              }).then(() => {
                window.location.href = "login.html";
              });
            }
          });
        });
      }
    })
    .catch((err) => {
      hideLoader();
      console.error("User fetch failed:", err);
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Unable to load your profile. Please log in again."
      }).then(() => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      });
    });
}
