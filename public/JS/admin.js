function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

// Check if user is admin
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!loggedInUser || loggedInUser.role !== 'admin') {
  Swal.fire({
    icon: "warning",
    title: "Access Denied",
    text: "You need to be an admin to access this page",
    confirmButtonColor: '#6f42c1'
  }).then(() => {
    showLoader();
    window.location.href = 'login.html';
  });
}

// Logout button
const logoutBtn = document.getElementById("Logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    showLoader();
    window.location.href = "login.html";
  });
}

let TPledges = 0;

const totalUsersEl = document.getElementById("totalUsers");
const activeCampaignsEl = document.getElementById("activeCampiagns");
const pendingApprovalEl = document.getElementById("pendingApproval");
let totalPledges = document.getElementById("totalPledges");
const userTableBody = document.querySelector("#user-management tbody");
const campaignList = document.querySelector("#campaign-approval .list-group");
const activeCampaignsTableBody = document.getElementById("activeCampaignsTableBody");

// fetch from db

Promise.all([
  fetch("http://localhost:3000/users").then(res => res.json()),
  fetch("http://localhost:3000/campaigns4").then(res => res.json())
]).then(([users, campaigns]) => {

  totalUsersEl.textContent = users.length;
  activeCampaignsEl.textContent = campaigns.filter(c => c.isApproved == true).length;
  pendingApprovalEl.textContent = campaigns.filter(c => c.isApproved === false).length;
  campaigns.forEach(campaign => {
    const raised = parseFloat(campaign.raised) || 0;
    TPledges += raised;
  });
  totalPledges.textContent = TPledges;

  // user table
  userTableBody.innerHTML = users.map(user => `
    <tr>
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge text-dark">${user.role}</span></td>
      <td><span class="badge text-dark">${user.isActive ? "active" : "banned"}</span></td>
      <td>
        ${user.isActive ? `
          <button class="btn btn-sm btn-danger me-1 toggle-user" data-id="${user.id}" data-action="ban">Ban</button>
        ` : `
          <button class="btn btn-sm btn-success me-1 toggle-user" data-id="${user.id}" data-action="unban">UnBan</button>
        `}
      </td>
    </tr>
  `).join("");

  // campaigns pending approval
  campaignList.innerHTML = campaigns
    .filter(c => c.isApproved === false)
    .map(campaign => `
      <div class="list-group-item">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6>${campaign.title}</h6>
            
            <p class="mt-2 mb-1">Goal: $${campaign.goal} | Deadline: ${campaign.deadline}</p>
          </div>
          <div class="btn-group">
            <button class="btn btn-sm btn-success me-1 approve-campaign" data-id="${campaign.id}">
              <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn btn-sm btn-danger reject-campaign" data-id="${campaign.id}">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>
        </div>
      </div>
    `).join("");

  // active campaigns table
  activeCampaignsTableBody.innerHTML = campaigns
    .filter(c => c.isApproved === true)
    .map(campaign => {
      const raised = parseFloat(campaign.raised) || 0;
      const goal = parseFloat(campaign.goal) || 1;
      const percentage = Math.min((raised / goal) * 100, 100).toFixed(0);

      return `
        <tr>
          <td>${campaign.title}</td>
          
          <td>
            <div class="progress" style="height: 5px;">
              <div class="progress-bar" style="width: ${percentage}%"></div>
            </div>
            <small>${percentage}% ($${raised.toLocaleString()}/${goal.toLocaleString()})</small>
          </td>
          <td>
            <button class="btn btn-sm btn-outline-danger delete-campaign" data-id="${campaign.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

  // Ban/Unban user
  document.addEventListener("click", async function (e) {
    const button = e.target.closest(".toggle-user");
    if (!button) return;

    const userId = button.dataset.id;
    const action = button.dataset.action;
    const isActive = action === "unban";

    try {
      await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isActive })
      });
     showLoader();
      location.reload();
    } catch (err) {
      console.error("Error updating user:", err);
    }
  });

  // Approve / Reject / Delete campaign
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".approve-campaign")) {
      const id = e.target.closest(".approve-campaign").dataset.id;

      await fetch(`http://localhost:3000/campaigns4/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true })
      });
     showLoader();
      location.reload();
    }

    if (e.target.closest(".reject-campaign")) {
      const id = e.target.closest(".reject-campaign").dataset.id;

      await fetch(`http://localhost:3000/campaigns4/${id}`, {
        method: "DELETE"
      });
       showLoader();
      location.reload();
    }

    if (e.target.closest(".delete-campaign")) {
      const id = e.target.closest(".delete-campaign").dataset.id;

      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: "This campaign will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, delete it!"
      });

      if (!confirmResult.isConfirmed) return;

      await fetch(`http://localhost:3000/campaigns4/${id}`, {
        method: "DELETE"
      });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "The campaign has been deleted.",
        timer: 1500,
        showConfirmButton: false
      });
           showLoader();
      setTimeout(() => location.reload(), 1600);
    }
  });

});
