const campaignsContainer = document.getElementById("campaigns-container");
const params = new URLSearchParams(window.location.search);
const selectedCategory = params.get("category");

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

// Loader functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

showLoader();

fetch("http://localhost:3000/campaigns4")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(campaigns => {
    let filteredCampaigns = campaigns.filter(c => c.isApproved === true);

    if (selectedCategory) {
      filteredCampaigns = filteredCampaigns.filter(
        c => c.category === selectedCategory
      );
    }

    if (filteredCampaigns.length === 0) {
      campaignsContainer.innerHTML = "<p>No campaigns found in this category.</p>";
      Swal.fire({
        icon: "info",
        title: "No Campaigns",
        text: "There are no campaigns available in this category."
      });
    } else {
      campaignsContainer.innerHTML = `
        <div class="row">
          ${filteredCampaigns.map(c => `
            <div class="col-12 col-sm-6 col-md-4 mb-4">
              <div class="card h-100">
                <img src="${c.images[0]}" class="card-img-top" alt="${c.title}">
                <div class="card-body d-flex flex-column">
                  <h5 class="card-title">${c.title}</h5>
                  <p class="card-text">${c.description}</p>
                  <a href="campaign.html?id=${c.id}" class="btn btn-primary mt-auto">View Campaign</a>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
  })
  .catch(error => {
    console.error("Error loading campaigns:", error);
    Swal.fire({
      icon: "error",
      title: "Loading Error",
      text: "Failed to load campaigns. Please try again later."
    });
    campaignsContainer.innerHTML = "<p class='text-danger'>Failed to load campaigns.</p>";
  })
  .finally(() => {
    hideLoader();
  });
