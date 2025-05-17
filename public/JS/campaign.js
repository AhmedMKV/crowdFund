

// Base URL for API requests
const API_URL = 'http://localhost:3000';


document.addEventListener('DOMContentLoaded', () => {
    // Initialize campaign management
    initCampaignManagement();
});

/**
 * Initialize campaign management functionality
 */
function initCampaignManagement() {
    // Check if user is logged in and has campaigner role
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }
    
    if (currentUser.role !== 'campaigner') {
        showNotification('You need campaigner privileges to access this page.', 'error');
        
        // If user is not a campaigner, show request form
        if (document.getElementById('request-campaigner-form')) {
            document.getElementById('request-campaigner-form').style.display = 'block';
            document.getElementById('campaign-management').style.display = 'none';
            
            // Add event listener for campaigner request
            document.getElementById('request-campaigner-btn').addEventListener('click', requestCampaignerRole);
        } else {
            window.location.href = '/index.html';
        }
        return;
    }
    
    // Load user's campaigns
    loadUserCampaigns();
    
    // Add event listeners for campaign creation form
    if (document.getElementById('create-campaign-form')) {
        document.getElementById('create-campaign-form').addEventListener('submit', createCampaign);
        
        // Add event listener for image upload
        document.getElementById('campaign-image').addEventListener('change', handleImageUpload);
        
        // Add event listener for adding rewards
        document.getElementById('add-reward-btn').addEventListener('click', addRewardField);
    }
}

/**
 * Request campaigner role
 */
async function requestCampaignerRole() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const response = await fetch(`${API_URL}/users/${currentUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                role: 'pending_campaigner'
            })
        });
        
        if (response.ok) {
            // Update local storage
            currentUser.role = 'pending_campaigner';
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showNotification('Campaigner role requested. Please wait for admin approval.', 'success');
        } else {
            throw new Error('Failed to request campaigner role');
        }
    } catch (error) {
        showNotification('Error requesting campaigner role: ' + error.message, 'error');
    }
}

/**
 * Load user's campaigns
 */
async function loadUserCampaigns() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const response = await fetch(`${API_URL}/campaigns?userId=${currentUser.id}`);
        const campaigns = await response.json();
        
        const container = document.getElementById('user-campaigns');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (campaigns.length === 0) {
            container.innerHTML = '<p>You have not created any campaigns yet.</p>';
            return;
        }
        
        campaigns.forEach(campaign => {
            const campaignCard = document.createElement('div');
            campaignCard.className = 'campaign-card';
            campaignCard.innerHTML = `
                <h3>${campaign.title}</h3>
                <p>${campaign.description.substring(0, 100)}...</p>
                <p>Goal: $${campaign.goal}</p>
                <p>Deadline: ${new Date(campaign.deadline).toLocaleDateString()}</p>
                <p>Status: ${campaign.isApproved ? 'Approved' : 'Pending Approval'}</p>
                <div class="action-buttons">
                    <button class="edit-campaign-btn" data-id="${campaign.id}">Edit</button>
                    <button class="view-pledges-btn" data-id="${campaign.id}">View Pledges</button>
                    <button class="post-update-btn" data-id="${campaign.id}">Post Update</button>
                </div>
            `;
            container.appendChild(campaignCard);
        });
        
        // Add event listeners
        document.querySelectorAll('.edit-campaign-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openEditCampaignModal(e.target.dataset.id);
            });
        });
        
        document.querySelectorAll('.view-pledges-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                viewCampaignPledges(e.target.dataset.id);
            });
        });
        
        document.querySelectorAll('.post-update-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openPostUpdateModal(e.target.dataset.id);
            });
        });
        
    } catch (error) {
        showNotification('Error loading campaigns: ' + error.message, 'error');
    }
}

/**
 * Handle image upload and convert to Base64
 * @param {Event} event - The change event from the file input
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size exceeds 5MB limit', 'error');
        event.target.value = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Image = e.target.result;
        
        // Store the base64 string in a hidden input
        const imagePreview = document.getElementById('image-preview');
        const base64Input = document.getElementById('image-base64');
        
        if (imagePreview) {
            imagePreview.src = base64Image;
            imagePreview.style.display = 'block';
        }
        
        if (base64Input) {
            base64Input.value = base64Image;
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * Add a new reward field to the campaign form
 */
function addRewardField() {
    const rewardsContainer = document.getElementById('rewards-container');
    const rewardCount = rewardsContainer.children.length;
    
    const rewardField = document.createElement('div');
    rewardField.className = 'reward-field';
    rewardField.innerHTML = `
        <h4>Reward ${rewardCount + 1}</h4>
        <div class="form-group">
            <label for="reward-amount-${rewardCount}">Amount ($)</label>
            <input type="number" id="reward-amount-${rewardCount}" name="reward-amount-${rewardCount}" min="1" required>
        </div>
        <div class="form-group">
            <label for="reward-description-${rewardCount}">Description</label>
            <textarea id="reward-description-${rewardCount}" name="reward-description-${rewardCount}" required></textarea>
        </div>
        <button type="button" class="remove-reward-btn">Remove</button>
    `;
    
    rewardsContainer.appendChild(rewardField);
    
    // Add event listener for remove button
    rewardField.querySelector('.remove-reward-btn').addEventListener('click', function() {
        rewardsContainer.removeChild(rewardField);
        // Renumber remaining rewards
        const remainingRewards = rewardsContainer.querySelectorAll('.reward-field');
        remainingRewards.forEach((field, index) => {
            field.querySelector('h4').textContent = `Reward ${index + 1}`;
        });
    });
}

/**
 * Create a new campaign
 * @param {Event} event - The form submit event
 */
async function createCampaign(event) {
    event.preventDefault();
    
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Get form values
        const title = document.getElementById('campaign-title').value;
        const description = document.getElementById('campaign-description').value;
        const goal = parseFloat(document.getElementById('campaign-goal').value);
        const deadline = document.getElementById('campaign-deadline').value;
        const imageBase64 = document.getElementById('image-base64').value;
        
        // Get rewards
        const rewards = [];
        const rewardFields = document.querySelectorAll('.reward-field');
        
        rewardFields.forEach((field, index) => {
            const amount = parseFloat(field.querySelector(`#reward-amount-${index}`).value);
            const description = field.querySelector(`#reward-description-${index}`).value;
            
            rewards.push({
                amount,
                description
            });
        });
        
        // Create campaign object
        const campaign = {
            title,
            description,
            goal,
            deadline,
            image: imageBase64,
            rewards,
            userId: currentUser.id,
            isApproved: false,
            createdAt: new Date().toISOString()
        };
        
        // Send POST request
        const response = await fetch(`${API_URL}/campaigns`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(campaign)
        });
        
        if (response.ok) {
            showNotification('Campaign created successfully! Waiting for admin approval.', 'success');
            
            // Reset form
            document.getElementById('create-campaign-form').reset();
            document.getElementById('image-preview').style.display = 'none';
            document.getElementById('rewards-container').innerHTML = '';
            
            // Reload user campaigns
            loadUserCampaigns();
        } else {
            throw new Error('Failed to create campaign');
        }
    } catch (error) {
        showNotification('Error creating campaign: ' + error.message, 'error');
    }
}

/**
 * Open modal to edit campaign
 * @param {string} campaignId - The ID of the campaign to edit
 */
async function openEditCampaignModal(campaignId) {
    try {
        const response = await fetch(`${API_URL}/campaigns/${campaignId}`);
        const campaign = await response.json();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Edit Campaign</h2>
                
                <form id="edit-campaign-form">
                    <input type="hidden" id="edit-campaign-id" value="${campaign.id}">
                    
                    <div class="form-group">
                        <label for="edit-campaign-title">Title</label>
                        <input type="text" id="edit-campaign-title" value="${campaign.title}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-campaign-description">Description</label>
                        <textarea id="edit-campaign-description" required>${campaign.description}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-campaign-goal">Goal ($)</label>
                        <input type="number" id="edit-campaign-goal" value="${campaign.goal}" min="1" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-campaign-deadline">Deadline</label>
                        <input type="date" id="edit-campaign-deadline" value="${campaign.deadline.split('T')[0]}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="edit-campaign-image">Image</label>
                        <input type="file" id="edit-campaign-image" accept="image/*">
                        <input type="hidden" id="edit-image-base64" value="${campaign.image || ''}">
                        ${campaign.image ? 
                            `<img id="edit-image-preview" src="${campaign.image}" alt="Campaign Image" style="display: block; max-width: 100%; margin-top: 10px;">` : 
                            `<img id="edit-image-preview" style="display: none; max-width: 100%; margin-top: 10px;">`
                        }
                    </div>
                    
                    <h3>Rewards</h3>
                    <div id="edit-rewards-container">
                        ${campaign.rewards && campaign.rewards.length > 0 ? 
                            campaign.rewards.map((reward, index) => `
                                <div class="reward-field">
                                    <h4>Reward ${index + 1}</h4>
                                    <div class="form-group">
                                        <label for="edit-reward-amount-${index}">Amount ($)</label>
                                        <input type="number" id="edit-reward-amount-${index}" value="${reward.amount}" min="1" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="edit-reward-description-${index}">Description</label>
                                        <textarea id="edit-reward-description-${index}" required>${reward.description}</textarea>
                                    </div>
                                    <button type="button" class="remove-reward-btn">Remove</button>
                                </div>
                            `).join('') : 
                            ''
                        }
                    </div>
                    
                    <button type="button" id="edit-add-reward-btn">Add Reward</button>
                    
                    <div class="form-actions">
                        <button type="submit" class="primary-btn">Save Changes</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        // Add event listener for image upload
        modal.querySelector('#edit-campaign-image').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('Image size exceeds 5MB limit', 'error');
                event.target.value = '';
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const base64Image = e.target.result;
                
                const imagePreview = document.getElementById('edit-image-preview');
                const base64Input = document.getElementById('edit-image-base64');
                
                if (imagePreview) {
                    imagePreview.src = base64Image;
                    imagePreview.style.display = 'block';
                }
                
                if (base64Input) {
                    base64Input.value = base64Image;
                }
            };
            
            reader.readAsDataURL(file);
        });
        
        // Add event listener for adding rewards
        modal.querySelector('#edit-add-reward-btn').addEventListener('click', function() {
            const rewardsContainer = document.getElementById('edit-rewards-container');
            const rewardCount = rewardsContainer.children.length;
            
            const rewardField = document.createElement('div');
            rewardField.className = 'reward-field';
            rewardField.innerHTML = `
                <h4>Reward ${rewardCount + 1}</h4>
                <div class="form-group">
                    <label for="edit-reward-amount-${rewardCount}">Amount ($)</label>
                    <input type="number" id="edit-reward-amount-${rewardCount}" min="1" required>
                </div>
                <div class="form-group">
                    <label for="edit-reward-description-${rewardCount}">Description</label>
                    <textarea id="edit-reward-description-${rewardCount}" required></textarea>
                </div>
                <button type="button" class="remove-reward-btn">Remove</button>
            `;
            
            rewardsContainer.appendChild(rewardField);
            
            // Add event listener for remove button
            rewardField.querySelector('.remove-reward-btn').addEventListener('click', function() {
                rewardsContainer.removeChild(rewardField);
                // Renumber remaining rewards
                const remainingRewards = rewardsContainer.querySelectorAll('.reward-field');
                remainingRewards.forEach((field, index) => {
                    field.querySelector('h4').textContent = `Reward ${index + 1}`;
                });
            });
        });
        
        // Add event listeners for existing remove buttons
        modal.querySelectorAll('.remove-reward-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const rewardField = this.closest('.reward-field');
                const rewardsContainer = document.getElementById('edit-rewards-container');
                
                rewardsContainer.removeChild(rewardField);
                
                // Renumber remaining rewards
                const remainingRewards = rewardsContainer.querySelectorAll('.reward-field');
                remainingRewards.forEach((field, index) => {
                    field.querySelector('h4').textContent = `Reward ${index + 1}`;
                });
            });
        });
        
        // Add event listener for form submission
        modal.querySelector('#edit-campaign-form').addEventListener('submit', async function(event) {
            event.preventDefault();
            
            try {
                const campaignId = document.getElementById('edit-campaign-id').value;
                
                // Get form values
                const title = document.getElementById('edit-campaign-title').value;
                const description = document.getElementById('edit-campaign-description').value;
                const goal = parseFloat(document.getElementById('edit-campaign-goal').value);
                const deadline = document.getElementById('edit-campaign-deadline').value;
                const imageBase64 = document.getElementById('edit-image-base64').value;
                
                // Get rewards
                const rewards = [];
                const rewardFields = document.querySelectorAll('#edit-rewards-container .reward-field');
                
                rewardFields.forEach((field, index) => {
                    const amount = parseFloat(field.querySelector(`#edit-reward-amount-${index}`).value);
                    const description = field.querySelector(`#edit-reward-description-${index}`).value;
                    
                    rewards.push({
                        amount,
                        description
                    });
                });
                
                // Create campaign object
                const updatedCampaign = {
                    title,
                    description,
                    goal,
                    deadline,
                    image: imageBase64,
                    rewards
                };
                
                // Send PATCH request
                const response = await fetch(`${API_URL}/campaigns/${campaignId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedCampaign)
                });
                
                if (response.ok) {
                    showNotification('Campaign updated successfully!', 'success');
                    
                    // Close modal
                    document.body.removeChild(modal);
                    
                    // Reload user campaigns
                    loadUserCampaigns();
                } else {
                    throw new Error('Failed to update campaign');
                }
            } catch (error) {
                showNotification('Error updating campaign: ' + error.message, 'error');
            }
        });
        
    } catch (error) {
        showNotification('Error loading campaign details: ' + error.message, 'error');
    }
}

/**
 * View pledges for a specific campaign
 * @param {string} campaignId - The ID of the campaign
 */
async function viewCampaignPledges(campaignId) {
    try {
        // Get campaign details
        const campaignResponse = await fetch(`${API_URL}/campaigns/${campaignId}`);
        const campaign = await campaignResponse.json();
        
        // Get pledges for this campaign
        const pledgesResponse = await fetch(`${API_URL}/pledges?campaignId=${campaignId}`);
        const pledges = await pledgesResponse.json();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Pledges for: ${campaign.title}</h2>
                
                <div class="campaign-stats">
                    <p><strong>Total pledges:</strong> ${pledges.length}</p>
                    <p><strong>Total amount:</strong> $${pledges.reduce((sum, pledge) => sum + pledge.amount, 0)}</p>
                    <p><strong>Goal:</strong> $${campaign.goal}</p>
                    <p><strong>Progress:</strong> ${Math.round((pledges.reduce((sum, pledge) => sum + pledge.amount, 0) / campaign.goal) * 100)}%</p>
                </div>
                
                <div class="pledges-list">
                    ${pledges.length > 0 ? 
                        pledges.map(pledge => `
                            <div class="pledge-item">
                                <p><strong>User ID:</strong> ${pledge.userId}</p>
                                <p><strong>Amount:</strong> $${pledge.amount}</p>
                                <p><strong>Reward:</strong> ${
                                    campaign.rewards && campaign.rewards.find(r => r.id === pledge.rewardId) 
                                        ? campaign.rewards.find(r => r.id === pledge.rewardId).description 
                                        : 'No reward'
                                }</p>
                                <p><strong>Date:</strong> ${pledge.date ? new Date(pledge.date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        `).join('') : 
                        '<p>No pledges yet for this campaign.</p>'
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
    } catch (error) {
        showNotification('Error loading pledges: ' + error.message, 'error');
    }
}

/**
 * Open modal to post an update for a campaign
 * @param {string} campaignId - The ID of the campaign
 */
function openPostUpdateModal(campaignId) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Post Campaign Update</h2>
            
            <form id="post-update-form">
                <input type="hidden" id="update-campaign-id" value="${campaignId}">
                
                <div class="form-group">
                    <label for="update-title">Title</label>
                    <input type="text" id="update-title" required>
                </div>
                
                <div class="form-group">
                    <label for="update-content">Content</label>
                    <textarea id="update-content" rows="6" required></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="primary-btn">Post Update</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Add event listener for form submission
    modal.querySelector('#post-update-form').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        try {
            const campaignId = document.getElementById('update-campaign-id').value;
            const title = document.getElementById('update-title').value;
            const content = document.getElementById('update-content').value;
            
            // Create update object
            const update = {
                campaignId,
                title,
                content,
                date: new Date().toISOString()
            };
            
            // Send POST request
            const response = await fetch(`${API_URL}/updates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(update)
            });
            
            if (response.ok) {
                showNotification('Update posted successfully!', 'success');
                
                // Close modal
                document.body.removeChild(modal);
            } else {
                throw new Error('Failed to post update');
            }
        } catch (error) {
            showNotification('Error posting update: ' + error.message, 'error');
        }
    });
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createCampaign,
        openEditCampaignModal,
        viewCampaignPledges,
        openPostUpdateModal,
        requestCampaignerRole
    };
}
