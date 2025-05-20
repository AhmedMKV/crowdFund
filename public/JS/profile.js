// Helper functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}


const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!storedUser) {
  Swal.fire({
    icon: "warning",
    title: "Not Logged In",
    text: "Please log in first.",
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

      if (user.role !== "backer") {
        return Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only backers can access this page.",
          confirmButtonText: "Go to Home"
        }).then(() => {
          window.location.href = "index.html";
        });
      }

      // Fill profile info
      const nameParts = user.name.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      document.getElementById("first-name").textContent = firstName;
      document.getElementById("last-name").textContent = lastName;
      document.getElementById("email").textContent = user.email;
      document.getElementById("phone").textContent = user.role;
      document.getElementById("bio").textContent = user.pledgedCampaigns.length;

      // Password change handling
      const changePasswordForm = document.getElementById("change-password-form");

      changePasswordForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const currentPassword = document.getElementById("currentPassword").value;
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (currentPassword !== user.password) {
          return Swal.fire({
            icon: "error",
            title: "Incorrect Password",
            text: "Current password is incorrect."
          });
        }

        if (newPassword.length < 6) {
          return Swal.fire({
            icon: "warning",
            title: "Weak Password",
            text: "New password must be at least 6 characters."
          });
        }

        if (newPassword !== confirmPassword) {
          return Swal.fire({
            icon: "error",
            title: "Password Mismatch",
            text: "New passwords do not match."
          });
        }

        showLoader();

        try {
          const response = await fetch(`http://localhost:3000/users/${user.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: newPassword }),
          });

          if (!response.ok) {
            throw new Error("Failed to update password");
          }

          const updatedUser = await response.json();
          localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

          hideLoader();

          Swal.fire({
            icon: "success",
            title: "Password Updated",
            text: "Your password was changed successfully."
          });

          changePasswordForm.reset();
        } catch (err) {
          hideLoader();
          console.error("Error updating password:", err);
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: "Something went wrong. Please try again later."
          });
        }
      });

      // Logout button
      const logoutBtn = document.getElementById("logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          Swal.fire({
            title: "Are you sure?",
            text: "You will be logged out.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, logout"
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
      console.error("Fetch error:", err);
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
