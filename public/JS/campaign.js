// Loader functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

//profile button handling
document.getElementById("profileBtn").addEventListener("click", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || !user.role) {
    Swal.fire({
      icon: "warning",
      title: "Not Logged In",
      text: "Please log in to access your profile.",
      confirmButtonText: "Go to Login"
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  showLoader();

  setTimeout(() => {  
    switch (user.role.toLowerCase()) {
      case "campaigner":
        window.location.href = "campaigner-profile.html";
        break;
      case "backer":
        window.location.href = "profile.html";
        break;
      case "admin":
        window.location.href = "admin.html";
        break;
      default:
        hideLoader();
        Swal.fire({
          icon: "error",
          title: "Unknown Role",
          text: "Your user role is not recognized. Please contact support."
        });
    }
  }, 300); 
});

// Get campaign ID from URL
const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");
localStorage.setItem("selectedCampaignId", campaignId);

if (!campaignId) {
  Swal.fire({
    icon: "error",
    title: "Missing Campaign ID",
    text: "Campaign ID not found in URL.",
    confirmButtonText: "Back to Home"
  }).then(() => {
    window.location.href = "index.html";
  });
}

// Start loader
showLoader();

// Fetch campaign data
fetch(`http://localhost:3000/campaigns4/${campaignId}`)
  .then(res => {
    if (!res.ok) throw new Error("Campaign not found");
    return res.json();
  })
  .then(campaign => {
    // Image
    const img = document.querySelector('.donation-image');
    img.src = (campaign.images && campaign.images[0]) || './assets/images/fallback.jpg';
    img.alt = campaign.title;

    // Title
    document.querySelector('.donation-header').textContent = campaign.title;

    // Raised amount
    document.querySelectorAll('.stat-number')[0].textContent = `$${campaign.raised.toLocaleString()}`;

    // Progress bar
    const percent = Math.min(100, (campaign.raised / campaign.goal) * 100).toFixed(1);
    const progressBar = document.querySelector('.progress-bar');
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
    progressBar.textContent = percent + '%';

    // Goal
    document.querySelector('.goal-info span:nth-child(1)').textContent = `Goal: $${campaign.goal.toLocaleString()}`;

    // About
    document.querySelector('.donation-content p').textContent = campaign.description;

    // Story
    document.querySelector('#story').innerHTML = `
      <h2 class="h5 mb-4 text-dark">Campaign Story</h2>
      <p class: "text-dark">${campaign.story || "No story provided yet."}</p>
    `;
  })
  .catch(err => {
    console.error("Error loading campaign:", err);
    Swal.fire({
      icon: "error",
      title: "Campaign Not Found",
      text: "Unable to load this campaign. It may have been deleted.",
      confirmButtonText: "Go Back"
    }).then(() => {
      window.location.href = "index.html";
    });
  })
  .finally(() => {
    hideLoader();
  });
