// Base URL for API requests
const API_URL = 'http://localhost:3000';

// Sample campaign data for initialization
const sampleCampaigns = [
    // Technology Category
    {
        id: 1,
        title: "Smart Home Energy Monitor",
        creator: "EcoTech Solutions",
        description: "A revolutionary device that monitors and optimizes home energy usage in real-time, helping homeowners reduce their carbon footprint and save up to 30% on energy bills.",
        category: "technology",
        goal: 75000,
        currentAmount: 45000,
        backers: 142,
        deadline: "2025-12-31",
        image: "assets/images/tc.JPG",
        createdAt: "2024-03-15"
    },
    // ... rest of the sample campaigns ...
];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createCampaignForm');
    const addRewardBtn = document.getElementById('addRewardBtn');
    const imageInput = document.getElementById('campaignImage');
    
    // Add first reward field by default
    addRewardField();
    
    // Add event listeners
    form.addEventListener('submit', handleFormSubmit);
    addRewardBtn.addEventListener('click', addRewardField);
    imageInput.addEventListener('change', handleImageUpload);
});

function addRewardField() {
    const container = document.getElementById('rewardsContainer');
    const rewardCount = container.children.length;
    
    const rewardDiv = document.createElement('div');
    rewardDiv.className = 'reward-field mb-3 p-3 border rounded';
    rewardDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h3 class="h6 mb-0">Reward ${rewardCount + 1}</h3>
            ${rewardCount > 0 ? '<button type="button" class="btn btn-sm btn-outline-danger remove-reward"><i class="fas fa-times"></i></button>' : ''}
        </div>
        <div class="mb-3">
            <label class="form-label">Amount ($)</label>
            <input type="number" class="form-control reward-amount" min="1" required>
        </div>
        <div class="mb-3">
            <label class="form-label">Description</label>
            <textarea class="form-control reward-description" rows="2" required></textarea>
        </div>
    `;
    
    container.appendChild(rewardDiv);
    
    // Add event listener for remove button
    const removeBtn = rewardDiv.querySelector('.remove-reward');
    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            container.removeChild(rewardDiv);
            updateRewardNumbers();
        });
    }
}

function updateRewardNumbers() {
    const rewards = document.querySelectorAll('.reward-field');
    rewards.forEach((reward, index) => {
        reward.querySelector('h3').textContent = `Reward ${index + 1}`;
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit');
        event.target.value = '';
    return;
  }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const img = preview.querySelector('img');
        img.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    try {
        const formData = collectFormData();
        if (!formData) return; // Stop if user is not logged in
        
        console.log('Form data collected:', formData);
        await submitCampaign(formData);
        
    } catch (error) {
        console.error('Error creating campaign:', error);
        alert('Error creating campaign. Please try again.');
    }
}

function validateForm() {
    const form = document.getElementById('createCampaignForm');
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return false;
    }
    return true;
}

function collectFormData() {
    // Get logged in user
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Please log in to create a campaign');
        window.location.href = 'login.html';
        return null;
    }

    const imageFile = document.getElementById('campaignImage').files[0];
    const imageBase64 = document.getElementById('imagePreview').querySelector('img').src;
    
    const rewards = [];
    document.querySelectorAll('.reward-field').forEach(field => {
        rewards.push({
            amount: parseFloat(field.querySelector('.reward-amount').value),
            description: field.querySelector('.reward-description').value
        });
    });
    
    return {
        title: document.getElementById('campaignTitle').value,
        category: document.getElementById('campaignCategory').value,
        description: document.getElementById('campaignDescription').value,
        image: imageBase64,
        goal: parseFloat(document.getElementById('campaignGoal').value),
        deadline: document.getElementById('campaignDeadline').value,
        rewards: rewards,
        creator: loggedInUser.name,
        creatorId: loggedInUser.id,
        currentAmount: 0,
        backers: 0,
        createdAt: new Date().toISOString()
    };
}

async function submitCampaign(campaignData) {
    try {
        console.log('Starting campaign submission...');
        
        // Get existing campaigns from localStorage
        let campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
        console.log('Existing campaigns:', campaigns.length);
        
        // Create new campaign object with unique ID
        const newCampaign = {
            ...campaignData,
            id: Date.now(), // Use timestamp as unique ID
            currentAmount: 0,
            backers: 0,
            isApproved: false,
            createdAt: new Date().toISOString()
        };
        
        console.log('New campaign data:', newCampaign);
        
        // Add the new campaign to the array
        campaigns.push(newCampaign);
        
        // Store updated campaigns in localStorage
        localStorage.setItem('campaigns', JSON.stringify(campaigns));
        console.log('Campaigns saved to localStorage:', campaigns.length);
        
        // Show success message
        alert('Campaign created successfully!');
        
        // Redirect to campaigns page with the selected category
        window.location.href = `campaigns.html?category=${campaignData.category}`;
        
    } catch (error) {
        console.error('Error submitting campaign:', error);
        throw error;
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addRewardField,
        handleImageUpload,
        collectFormData,
        submitCampaign
    };
}
