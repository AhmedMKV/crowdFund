// Spinner functions
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

// Load campaigns with loader
const carousel = document.getElementById("carouselContent");

async function loadCampaigns() {
  try {
    showLoader();
    const res = await fetch("http://localhost:3000/campaigns4");
    if (!res.ok) throw new Error("Failed to fetch campaigns");

    const data = await res.json();
    const approvedCampaigns = data.filter(c => c.isApproved && c.raised < c.goal);

    approvedCampaigns.forEach((campaign, index) => {
      const activeClass = index === 0 ? "active" : "";
      const progressPercent = Math.min(100, (campaign.raised / campaign.goal) * 100);
      const imgSrc = campaign.images && campaign.images.length > 0
        ? campaign.images[0]
        : "./assets/images/art.jpg";

      const item = document.createElement("div");
      item.className = `carousel-item ${activeClass}`;
      item.innerHTML = `
        <div class="row justify-content-center">
          <div class="col-md-4 mb-3">
            <div class="card h-100">
              <img src="${imgSrc}" class="card-img-top" alt="${campaign.title}" />
              <div class="card-body d-flex flex-column">
                <h5 class="text-color">${campaign.title}</h5>
                <p class="card-text text-color">${campaign.description}</p>
                <div class="progress mb-2">
                  <div class="progress-bar" style="width: ${progressPercent}%">
                    ${Math.round(progressPercent)}%
                  </div>
                </div>
                <a href="campaign.html?id=${campaign.id}" class="btn btn-primary mt-auto">
                  Back Now
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      carousel.appendChild(item);
    });
  } catch (error) {
    console.error("Error loading campaigns:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unable to load campaigns. Please try again later.",
    });
  } finally {
    hideLoader();
  }
}

loadCampaigns();
