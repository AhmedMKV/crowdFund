// Check if user is logged in
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "campaigner") {
  window.location.href = "index.html";
}

// Logout logic
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}

const tableBody = document.querySelector("tbody");

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
  });
