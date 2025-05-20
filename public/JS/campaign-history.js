// Show/hide loader
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

// Check if user is logged in
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) {
  Swal.fire({
    icon: "warning",
    title: "Not Logged In",
    text: "You need to log in first.",
    confirmButtonText: "Go to Login"
  }).then(() => {
    window.location.href = "login.html";
  });
}

if (user.role !== "campaigner") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "Only campaigners can access this page.",
    confirmButtonText: "Go to Home"
  }).then(() => {
    window.location.href = "index.html";
  });
}

// Logout logic
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Logout",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
      }
    });
  });
}

const tableBody = document.querySelector("tbody");

// Start loading
showLoader();

fetch(`http://localhost:3000/users/${user.id}`)
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch user data");
    return res.json();
  })
  .then(userData => {
    const createdCampaigns = userData.createdCampaigns || [];

    return fetch("http://localhost:3000/campaigns4")
      .then(res => res.json())
      .then(campaigns => {
        const campaignMap = {};
        campaigns.forEach(c => {
          campaignMap[c.id] = c;
        });

        tableBody.innerHTML = "";

        createdCampaigns.forEach(id => {
          const campaign = campaignMap[id];
          if (!campaign) return;

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${campaign.title}</td>
            <td>$${parseFloat(campaign.goal).toFixed(2)}</td>
            <td>$${parseFloat(campaign.raised).toFixed(2)}</td>
            <td>${campaign.deadline}</td>
          `;
          tableBody.appendChild(tr);
        });
      });
  })
  .catch(err => {
    console.error("Error loading created campaigns:", err);
    Swal.fire({
      icon: "error",
      title: "Loading Error",
      text: "Failed to load your campaigns. Please try again later."
    });
  })
  .finally(() => {
    hideLoader();
  });
