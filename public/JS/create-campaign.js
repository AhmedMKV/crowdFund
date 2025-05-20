const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!loggedInUser || loggedInUser.role !== "campaigner") {
  Swal.fire({
    icon: "error",
    title: "Access Denied",
    text: "You need to be a campaigner to access this page.",
    confirmButtonText: "Go to Home",
  }).then(() => {
    window.location.href = "index.html";
  });
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

const form = document.querySelector("form");

// Spinner functions
function showLoader() {
  document.getElementById("loader-overlay").style.display = "flex";
}
function hideLoader() {
  document.getElementById("loader-overlay").style.display = "none";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Selecting elements
  const title = document.getElementById("campaignTitle").value.trim();
  const category = document.getElementById("campaignCategory").value;
  const description = document.getElementById("campaignDescription").value.trim();
  const fundingGoal = document.getElementById("fundingGoal").value.trim();
  const campaignDuration = document.getElementById("campaignDuration").value.trim();
  const story = document.getElementById("campaignStory").value.trim();
  const imageInput = document.getElementById("campaignImages");
  const file = imageInput.files[0];

  // Validation
  const fundingGoalRegex = /^(?:[1-9]\d{2,}|[1-9]\d{3,})$/;
  if (!fundingGoalRegex.test(fundingGoal)) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Funding Goal",
      text: "Funding goal must be at least 100.",
    });
    return;
  }

  const campaignDurationRegex = /^(?:[7-9]|[1-2]\d|30)$/;
  if (!campaignDurationRegex.test(campaignDuration)) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Duration",
      text: "Campaign duration must be between 7 and 30 days.",
    });
    return;
  }

  if (!file) {
    Swal.fire({
      icon: "warning",
      title: "No Image Selected",
      text: "Please upload a campaign image.",
    });
    return;
  }

  showLoader(); // Start spinner

  try {
    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    const base64Image = await toBase64(file);
    const today = new Date();
    const deadline = new Date(today.getTime() + Number(campaignDuration) * 24 * 60 * 60 * 1000);
    const deadlineISO = deadline.toISOString().split("T")[0];

    const newCampaign = {
      title,
      category,
      description,
      goal: Number(fundingGoal),
      deadline: deadlineISO,
      story,
      creatorId: loggedInUser.id,
      images: [base64Image],
      isApproved: false,
      raised: 0,
    };

    const res = await fetch("http://localhost:3000/campaigns4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });

    if (!res.ok) throw new Error("Failed to create campaign.");

    const createdCampaign = await res.json();
    const userRes = await fetch(`http://localhost:3000/users/${loggedInUser.id}`);
    if (!userRes.ok) throw new Error("Failed to fetch user data.");

    const user = await userRes.json();
    const updatedCreatedCampaigns = user.createdCampaigns || [];
    updatedCreatedCampaigns.push(createdCampaign.id);

    const patchUserRes = await fetch(`http://localhost:3000/users/${loggedInUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ createdCampaigns: updatedCreatedCampaigns }),
    });

    if (!patchUserRes.ok) throw new Error("Failed to update user campaigns.");

    hideLoader(); // Stop spinner

    Swal.fire({
      icon: "success",
      title: "Campaign Created!",
      text: "Waiting for admin approval.",
      confirmButtonText: "View Campaigns",
    }).then(() => {
      window.location.href = "./campaigns.html";
    });

  } catch (err) {
    console.error(err);
    hideLoader();
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Something went wrong. Please try again.",
    });
  }
});
