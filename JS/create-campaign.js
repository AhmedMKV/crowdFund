  console.log(localStorage.getItem("loggedInUser"));

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  //selecting elements
  const title = document.getElementById("campaignTitle").value.trim();
  const category = document.getElementById("campaignCategory").value;
  const description = document
    .getElementById("campaignDescription")
    .value.trim();
  const fundingGoal = document.getElementById("fundingGoal").value.trim();
  const campaignDuration = document
    .getElementById("campaignDuration")
    .value.trim();
  const story = document.getElementById("campaignStory").value.trim();

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!loggedInUser || loggedInUser.role !== "campaigner") {
    window.location.href="index.html";
    return;
  }
  

  //validation
  //fund >=100
  const fundingGoalRegex = /^(?:[1-9]\d{2,}|[1-9]\d{3,})$/;
  if (!fundingGoalRegex.test(fundingGoal)) {
    alert("fund must be atleast 100");
    return;
  }

  //30>campaig duration>7
  const campaignDurationRegex = /^(?:[7-9]|[1-5]\d|30)$/;
  if (!campaignDurationRegex.test(campaignDuration)) {
    alert("campaign duration must be between 7 and 30 days");
    return;
  }

  //select img input
  const imageInput = document.getElementById("campaignImages");

  const file = imageInput.files[0];
  if (!file) {
    alert("no file available");
    return;
  }
  //image handling
  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const base64Image = await toBase64(file);

  const today = new Date();
  const deadline = new Date(
    today.getTime() + Number(campaignDuration) * 24 * 60 * 60 * 1000
  );
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
  };

  try {
    const res = await fetch("http://localhost:4000/campaigns4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCampaign),
    });

    if (!res.ok) throw new Error("Failed to create campaign.");

/*     alert("Campaign created successfully! Waiting for admin approval.");
 */    
    window.location.href = "campaigns.html";
  } catch (err) {
    alert("Something went wrong. Please try again.");
  }
});
