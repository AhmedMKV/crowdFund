// Check if user is admin
const checkAdminAuth = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser || loggedInUser.role !== 'admin') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
};

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAdminAuth()) return;
    
    // Load initial data
    loadUsers();
    loadCampaigns();
    loadPledges();
    updateDashboardStats();
    
    // Set up tab switching
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            switchTab(targetId);
        });
    });

    // Set up logout
    document.querySelector('.btn-outline-danger').addEventListener('click', () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    });
});

// Tab switching logic
const switchTab = (tabId) => {
    document.querySelectorAll('.tab-pane').forEach(tab => {
        tab.classList.remove('show', 'active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('show', 'active');
    document.querySelector(`[href="#${tabId}"]`).classList.add('active');
};

// Dashboard Stats
const updateDashboardStats = async () => {
    try {
        const [users, campaigns, pledges] = await Promise.all([
            fetch('http://localhost:4000/users').then(res => res.json()),
            fetch('http://localhost:4000/campaigns4').then(res => res.json()),
            fetch('http://localhost:4000/pledges').then(res => res.json())
        ]);

        // Update stats cards
        document.querySelector('.card.bg-primary h2').textContent = users.length;
        document.querySelector('.card.bg-success h2').textContent = 
            campaigns.filter(c => c.isApproved).length;
        document.querySelector('.card.bg-warning h2').textContent = 
            campaigns.filter(c => !c.isApproved).length;
        document.querySelector('.card.bg-danger h2').textContent = 
            `$${pledges.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`;
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
};

// User Management Functions
const loadUsers = async () => {
    try {
        const response = await fetch('http://localhost:4000/users');
        const users = await response.json();
        
        const userTableBody = document.querySelector('#user-management tbody');
        userTableBody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge bg-${getRoleBadgeColor(user.role)}">${user.role}</span></td>
                <td><span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
                    ${user.isActive ? 'Active' : 'Banned'}
                </span></td>
                <td>
                    ${user.role === 'backer' ? `
                        <button class="btn btn-sm btn-success me-1" onclick="approveCampaigner('${user.id}')">
                            <i class="fas fa-check"></i> Approve Campaigner
                        </button>
                    ` : ''}
                    <button class="btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}" 
                            onclick="toggleUserStatus('${user.id}', ${!user.isActive})">
                        <i class="fas fa-${user.isActive ? 'ban' : 'check'}"></i>
                        ${user.isActive ? 'Ban' : 'Unban'}
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading users:', error);
        alert('Failed to load users');
    }
};

// Campaign Management Functions
const loadCampaigns = async () => {
    try {
        const response = await fetch('http://localhost:4000/campaigns4');
        const campaigns = await response.json();
        
        // Update pending campaigns list
        const pendingCampaigns = campaigns.filter(c => !c.isApproved);
        const pendingList = document.querySelector('#campaign-approval .list-group');
        pendingList.innerHTML = '';
        
        pendingCampaigns.forEach(campaign => {
            const item = document.createElement('div');
            item.className = 'list-group-item';
            item.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6>${campaign.title}</h6>
                        <small class="text-muted">By ${getUserName(campaign.creatorId)}</small>
                        <p class="mt-2 mb-1">Goal: $${campaign.goal} | Deadline: ${campaign.deadline}</p>
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-success me-1" onclick="approveCampaign('${campaign.id}')">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCampaign('${campaign.id}')">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    </div>
                </div>
            `;
            pendingList.appendChild(item);
        });

        // Update active campaigns table
        const activeCampaigns = campaigns.filter(c => c.isApproved);
        const activeTable = document.querySelector('#campaign-approval .table tbody');
        activeTable.innerHTML = '';
        
        activeCampaigns.forEach(campaign => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${campaign.title}</td>
                <td>${getUserName(campaign.creatorId)}</td>
                <td>
                    <div class="progress" style="height: 5px;">
                        <div class="progress-bar" style="width: ${calculateProgress(campaign)}%"></div>
                    </div>
                    <small>${calculateProgress(campaign)}% ($${campaign.goal})</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCampaign('${campaign.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            activeTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading campaigns:', error);
        alert('Failed to load campaigns');
    }
};

// Pledge Management Functions
const loadPledges = async () => {
    try {
        const response = await fetch('http://localhost:4000/pledges');
        const pledges = await response.json();
        
        const pledgeTableBody = document.querySelector('#pledges tbody');
        pledgeTableBody.innerHTML = '';
        
        for (const pledge of pledges) {
            const campaign = await getCampaign(pledge.campaignId);
            const user = await getUser(pledge.userId);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pledge.id}</td>
                <td>${campaign?.title || 'Unknown Campaign'}</td>
                <td>${user?.name || 'Unknown User'}</td>
                <td>$${pledge.amount}</td>
                <td>${pledge.rewardId ? getRewardTitle(campaign, pledge.rewardId) : 'No Reward'}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td><span class="badge bg-success">Completed</span></td>
            `;
            pledgeTableBody.appendChild(row);
        }
    } catch (error) {
        console.error('Error loading pledges:', error);
        alert('Failed to load pledges');
    }
};

// Helper Functions
const getRoleBadgeColor = (role) => {
    const colors = {
        admin: 'danger',
        campaigner: 'primary',
        backer: 'info'
    };
    return colors[role] || 'secondary';
};

const getUserName = async (userId) => {
    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`);
        const user = await response.json();
        return user.name;
    } catch {
        return 'Unknown User';
    }
};

const getCampaign = async (campaignId) => {
    try {
        const response = await fetch(`http://localhost:4000/campaigns4/${campaignId}`);
        return await response.json();
    } catch {
        return null;
    }
};

const getUser = async (userId) => {
    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`);
        return await response.json();
    } catch {
        return null;
    }
};

const getRewardTitle = (campaign, rewardId) => {
    return campaign?.rewards?.find(r => r.id === rewardId)?.title || 'Unknown Reward';
};

const calculateProgress = (campaign) => {
    // This is a placeholder - you'll need to implement actual progress calculation
    return Math.floor(Math.random() * 100);
};

// User Management Actions
const approveCampaigner = async (userId) => {
    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'campaigner' })
        });
        
        if (response.ok) {
            loadUsers();
            alert('User role updated successfully');
        } else {
            throw new Error('Failed to update user role');
        }
    } catch (error) {
        console.error('Error updating user role:', error);
        alert('Failed to update user role');
    }
};

const toggleUserStatus = async (userId, newStatus) => {
    try {
        const response = await fetch(`http://localhost:4000/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: newStatus })
        });
        
        if (response.ok) {
            loadUsers();
            alert(`User ${newStatus ? 'unbanned' : 'banned'} successfully`);
        } else {
            throw new Error('Failed to update user status');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        alert('Failed to update user status');
    }
};

// Campaign Management Actions
const approveCampaign = async (campaignId) => {
    try {
        const response = await fetch(`http://localhost:4000/campaigns4/${campaignId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isApproved: true })
        });
        
        if (response.ok) {
            loadCampaigns();
            alert('Campaign approved successfully');
        } else {
            throw new Error('Failed to approve campaign');
        }
    } catch (error) {
        console.error('Error approving campaign:', error);
        alert('Failed to approve campaign');
    }
};

const deleteCampaign = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
        const response = await fetch(`http://localhost:4000/campaigns4/${campaignId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadCampaigns();
            alert('Campaign deleted successfully');
        } else {
            throw new Error('Failed to delete campaign');
        }
    } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
    }
};