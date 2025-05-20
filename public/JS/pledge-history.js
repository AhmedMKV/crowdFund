// Helper functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

// Check for user
const user = JSON.parse(localStorage.getItem("loggedInUser"));

if (!user) {
  Swal.fire({
    icon: "warning",
    title: "Not Logged In",
    text: "Please log in first!",
    confirmButtonText: "Go to Login",
  }).then(() => {
    window.location.href = "login.html";
  });
} else if (user.role !== "backer") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "Only backers can view this page.",
  }).then(() => {
    window.location.href = "index.html";
  });
}

const userId = user?.id;
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggedInUser");
        Swal.fire({
          icon: "success",
          title: "Logged out",
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          window.location.href = "login.html";
        });
      }
    });
  });
}

// Table and fetch logic
const tableBody = document.querySelector("tbody");
showLoader();

fetch(`http://localhost:3000/users/${userId}`)
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch user data");
    return res.json();
  })
  .then((userData) => {
    const pledgedCampaigns = userData.pledgedCampaigns || [];

    return fetch(`http://localhost:3000/campaigns4`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch campaigns");
        return res.json();
      })
      .then((campaigns) => {
        const campaignMap = {};
        campaigns.forEach((c) => {
          campaignMap[c.id] = c;
        });

        tableBody.innerHTML = "";

        pledgedCampaigns.forEach((e) => {
          const campaign = campaignMap[e.campaignId];
          if (!campaign) return;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${e.date}</td>
            <td><p>${campaign.title}</p></td>
            <td>$${parseFloat(e.amount).toFixed(2)}</td>
          `;
          tableBody.appendChild(tr);
        });

        hideLoader();
      });
  })
  .catch((err) => {
    hideLoader();
    console.error("Error loading pledge history:", err);
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: "Failed to load pledge history. Please try again later.",
    });
  });
