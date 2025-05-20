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

// Select elements
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

// User role validation
if (!currentUser || currentUser.role !== "backer") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "Only users with role 'backer' can make a pledge.",
    confirmButtonText: "Go to Login"
  }).then(() => {
    showLoader();
    window.location.href = "../login.html";
  });
}

// Load campaign details
showLoader();
fetch(`${API_URL}/campaigns4/${selectedCampaignId}`)
  .then((res) => res.json())
  .then((campaign) => {
    campaignTitleElement.textContent = campaign.title;
    campaignImage.src = campaign.images[0];

    const progressPercent = (campaign.raised / campaign.goal) * 100;
    progressBar.style.width = `${Math.min(progressPercent, 100)}%`;
    fundingText.innerHTML = `<strong>$${campaign.raised}</strong> raised of $${campaign.goal} goal`;

    // Check if goal is already met
    if (campaign.raised >= campaign.goal) {
      pledgeForm.querySelector("button[type='submit']").disabled = true;
      pledgeAmountInput.disabled = true;

      Swal.fire({
        icon: "info",
        title: "Goal Reached",
        text: "This campaign has already reached its funding goal.",
      });
    }
  })
  .catch((err) => {
    console.error("Error loading campaign:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Unable to load campaign information.",
    });
  })
  .finally(() => {
    hideLoader();
  });

// Form validation
function validateFormFields() {
  const cardNumberRegex = /^\d{16}$/;
  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  const cvvRegex = /^\d{3}$/;
  const zipRegex = /^\d{4,10}$/;

  if (pledgeAmountInput.value <= 0) {
    Swal.fire("Invalid Amount", "Pledge amount must be greater than 0.", "warning");
    return false;
  }

  if (!cardName.value.trim()) {
    Swal.fire("Missing Info", "Please enter the name on the card.", "warning");
    return false;
  }

  if (!cardNumberRegex.test(cardNumber.value)) {
    Swal.fire("Invalid Card", "Card number must be 16 digits.", "warning");
    return false;
  }

  if (!expiryRegex.test(expiryDate.value)) {
    Swal.fire("Invalid Expiry", "Expiry date must be in MM/YY format.", "warning");
    return false;
  }

  if (!cvvRegex.test(cvv.value)) {
    Swal.fire("Invalid CVV", "CVV must be exactly 3 digits.", "warning");
    return false;
  }

  if (!zipRegex.test(zipCode.value)) {
    Swal.fire("Invalid ZIP", "Please enter a valid ZIP code.", "warning");
    return false;
  }

  if (!termsAgreement.checked) {
    Swal.fire("Terms Required", "You must agree to the terms before pledging.", "warning");
    return false;
  }

  return true;
}

// Handle pledge submit
pledgeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!validateFormFields()) return;

  const pledgeAmount = Number(pledgeAmountInput.value);

  try {
    showLoader();

    const campaignRes = await fetch(`${API_URL}/campaigns4/${selectedCampaignId}`);
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

    Swal.fire({
      icon: "success",
      title: "Thank You!",
      text: "Your pledge has been recorded successfully.",
      confirmButtonText: "OK"
    }).then(() => {
      showLoader();
      window.location.href = "../campaigns.html";
    });

  } catch (error) {
    console.error("Pledge failed:", error);
    Swal.fire("Error", "Something went wrong while processing your pledge.", "error");
  } finally {
    hideLoader();
  }
});
