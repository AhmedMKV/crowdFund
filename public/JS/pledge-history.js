//checking for user
const user = JSON.parse(localStorage.getItem("loggedInUser"));
console.log(user);
const userId = user.id;

if (!user) {
  window.location.href = "login.html";
}

if (user.role !== "backer") {
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

//select element
const tableBody = document.querySelector("tbody");

fetch(`http://localhost:3000/users/${userId}`)
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch user data");
    return res.json();
  })
  .then((userData) => {
    const pledgedCampaigns = userData.pledgedCampaigns || [];

    return fetch(`http://localhost:3000/campaigns4`)
      .then((res) => res.json())
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
            <td>
              <p>${campaign.title}</p>
              
            </td>
            <td>$${parseFloat(e.amount).toFixed(2)}</td>
          `;
          tableBody.appendChild(tr);
        });
      });
  })
  .catch((err) => {
    console.error("Error loading pledge history:", err);
  });
