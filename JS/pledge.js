
//static campaign just for testing
localStorage.setItem("selectedCampaignId", "44c7");

//selecting elements 
const pledgeForm = document.getElementById("pledgeForm");
const pledgeAmountInput = document.getElementById("pledgeAmount");
const campaignTitleElement = document.getElementById("campaignTitle");
const campaignImage = document.querySelector("img[alt='Campaign Image']");
const progressBar = document.querySelector(".progress-bar");
const fundingText = document.querySelector(".progress + .d-flex span");

const cardName = document.getElementById("cardName");
const cardNumber = document.getElementById("cardNumber");
const expiryDate = document.getElementById("expiryDate");
const cvv = document.getElementById("cvv");
const zipCode = document.getElementById("zipCode");
const termsAgreement = document.getElementById("termsAgreement");

const API_URL = "http://localhost:3000";
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
const selectedCampaignId = localStorage.getItem("selectedCampaignId");

//user valisation
if (!currentUser || currentUser.role !== "backer") {
  alert("Only users with role 'backer' can make a pledge.");
  window.location.href = "login.html";
}

// get campaign
fetch(`${API_URL}/campaigns4/${selectedCampaignId}`)
  .then((res) => res.json())
  .then((campaign) => {
    campaignTitleElement.textContent = campaign.title;
    campaignImage.src = campaign.images[0];

    const progressPercent = (campaign.raised / campaign.goal) * 100;
    progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    fundingText.innerHTML = `<strong>$${campaign.raised}</strong> raised of $${campaign.goal} goal`;

    //check for campaign goal
      if (campaign.raised >= campaign.goal) {
      pledgeForm.querySelector("button[type='submit']").disabled = true;
      pledgeAmountInput.disabled = true;
      alert("This campaign has already reached its funding goal.");
    }
  })
  .catch((err) => {
    console.error("Error loading campaign:", err);
    alert("Unable to load campaign information.");
  });

// validation
function validateFormFields() {
  const cardNumberRegex = /^\d{16}$/;
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvRegex = /^\d{3}$/;
  const zipRegex = /^\d{4,10}$/;

  if (pledgeAmountInput.value <= 0) {
    alert("Pledge amount must be greater than 0.");
    return false;
  }

  if (!cardName.value.trim()) {
    alert("Please enter the name on the card.");
    return false;
  }

  if (!cardNumberRegex.test(cardNumber.value)) {
    alert("Card number must be 16 digits.");
    return false;
  }

  if (!expiryRegex.test(expiryDate.value)) {
    alert("Expiry date must be in MM/YY format.");
    return false;
  }

  if (!cvvRegex.test(cvv.value)) {
    alert("CVV must be exactly 3 digits.");
    return false;
  }

  if (!zipRegex.test(zipCode.value)) {
    alert("Please enter a valid ZIP code.");
    return false;
  }

  if (!termsAgreement.checked) {
    alert("You must agree to the terms before pledging.");
    return false;
  }

  return true;
}

// data handling
pledgeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateFormFields()) return;

  const pledgeAmount = Number(pledgeAmountInput.value);

  try {
    const campaignRes = await fetch(
      `${API_URL}/campaigns4/${selectedCampaignId}`
    );
    const campaign = await campaignRes.json();

    const newRaised = campaign.raised + pledgeAmount;
    await fetch(`${API_URL}/campaigns4/${selectedCampaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raised: newRaised }),
    });

    const userRes = await fetch(`${API_URL}/users/${currentUser.id}`);
    const user = await userRes.json();

    const updatedPledges = user.pledgedCampaigns || [];

    const newPledge = {
      campaignId: selectedCampaignId,
      amount: pledgeAmount,
      date: new Date().toISOString().split("T")[0],
    };

    updatedPledges.push(newPledge);

    await fetch(`${API_URL}/users/${currentUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pledgedCampaigns: updatedPledges }),
    });

    alert("Thank you for your pledge!");
    window.location.href = "campaigns.html";
  } catch (error) {
   /*  console.error("Pledge failed:", error);
    alert("An error occurred while processing your pledge. Please try again."); */
  }
});
