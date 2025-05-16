const container = document.getElementById("campaignsContainer");

fetch("http://localhost:4000/campaigns4")
  .then((res) => {
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    return res.json();
  })
  .then((campaigns) => {
    if (!campaigns.length) {
      container.innerHTML = "<p>No campaigns found.</p>";
      return;
    }

    campaigns.forEach((campaign) => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";

      div.innerHTML = `
        <h2>${campaign.title}</h2>
        <p><strong>Category:</strong> ${campaign.category}</p>
        <p><strong>Description:</strong> ${campaign.description}</p>
        <p><strong>Goal:</strong> $${campaign.goal}</p>
        <p><strong>Deadline:</strong> ${campaign.deadline}</p>
        <p><strong>Story:</strong> ${campaign.story}</p>
        ${
          campaign.images?.length
            ? `<img src="${campaign.images[0]}" alt="Campaign Image" style="max-width: 200px;"/>`
            : ""
        }
      `;

      container.appendChild(div);
    });
  })
  .catch((err) => {
    console.error("Error:", err);
    container.innerHTML = "<p>Error loading campaigns.</p>";
  });
