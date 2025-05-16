
// Base URL for API requests
const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize application
    initApp();
});

/**
 * Initialize the application
 */
function initApp() {
    // Check authentication status
    checkAuthStatus();
    
    // Setup navigation
    setupNavigation();
    
    // Load featured campaigns on homepage
    if (document.getElementById('featured-campaigns')) {
        loadFeaturedCampaigns();
    }
    
    // Setup search functionality
    if (document.getElementById('search-form')) {
        document.getElementById('search-form').addEventListener('submit', handleSearch);
    }
    
    // Setup category filters
    setupCategoryFilters();
    
    // Setup scroll to top button
    setupScrollToTop();
}

/**
 * Check if user is authenticated and update UI accordingly
 */
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    
    if (currentUser) {
        // User is logged in
        if (authLinks) {
            authLinks.style.display = 'none';
        }
        
        if (userMenu) {
            userMenu.style.display = 'flex';
            document.getElementById('user-name').textContent = currentUser.name;
            
            // Show appropriate dashboard link based on role
            const adminDashboardLink = document.getElementById('admin-dashboard-link');
            const campaignerDashboardLink = document.getElementById('campaigner-dashboard-link');
            const backerDashboardLink = document.getElementById('backer-dashboard-link');
            
            if (adminDashboardLink) {
                adminDashboardLink.style.display = currentUser.role === 'admin' ? 'block' : 'none';
            }
            
            if (campaignerDashboardLink) {
                campaignerDashboardLink.style.display = 
                    currentUser.role === 'campaigner' || currentUser.role === 'pending_campaigner' ? 'block' : 'none';
            }
            
            if (backerDashboardLink) {
                backerDashboardLink.style.display = 'block'; // All logged in users can be backers
            }
            
            // Setup logout button
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        }
    } else {
        // User is not logged in
        if (authLinks) {
            authLinks.style.display = 'flex';
        }
        
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // Redirect from protected pages
        const protectedPages = [
            '/admin.html',
            '/campaign-management.html',
            '/backer-dashboard.html',
            '/create-campaign.html'
        ];
        
        const currentPath = window.location.pathname;
        
        if (protectedPages.some(page => currentPath.endsWith(page))) {
            window.location.href = '/login.html';
        }
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    localStorage.removeItem('currentUser');
    showNotification('You have been logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/index.html';
    }, 1000);
}

/**
 * Setup navigation menu and mobile responsiveness
 */
function setupNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    }
    
    // Highlight current page in navigation
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href)) {
            link.classList.add('active');
        }
    });
}

/**
 * Load featured campaigns on the homepage
 */
async function loadFeaturedCampaigns() {
    try {
        const response = await fetch(`${API_URL}/campaigns?isApproved=true&_sort=createdAt&_order=desc&_limit=6`);
        const campaigns = await response.json();
        
        const container = document.getElementById('featured-campaigns');
        container.innerHTML = '';
        
        if (campaigns.length === 0) {
            container.innerHTML = '<p>No campaigns available at the moment.</p>';
            return;
        }
        
        campaigns.forEach(campaign => {
            // Calculate progress percentage
            let progressPercentage = 0;
            
            if (campaign.pledged && campaign.goal) {
                progressPercentage = Math.min(Math.round((campaign.pledged / campaign.goal) * 100), 100);
            }
            
            // Calculate days remaining
            const deadline = new Date(campaign.deadline);
            const today = new Date();
            const daysRemaining = Math.max(0, Math.ceil((deadline - today) / (1000 * 60 * 60 * 24)));
            
            const campaignCard = document.createElement('div');
            campaignCard.className = 'campaign-card';
            campaignCard.innerHTML = `
                <div class="campaign-image">
                    ${campaign.image ? 
                        `<img src="${campaign.image}" alt="${campaign.title}">` : 
                        `<div class="placeholder-image">No Image</div>`
                    }
                </div>
                <div class="campaign-content">
                    <h3>${campaign.title}</h3>
                    <p class="campaign-description">${campaign.description.substring(0, 100)}...</p>
                    
                    <div class="campaign-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-stats">
                            <span>${progressPercentage}% funded</span>
                            <span>$${campaign.pledged || 0} raised</span>
                            <span>${daysRemaining} days left</span>
                        </div>
                    </div>
                    
                    <a href="/campaign-details.html?id=${campaign.id}" class="view-campaign-btn">View Campaign</a>
                </div>
            `;
            
            container.appendChild(campaignCard);
        });
        
    } catch (error) {
        showNotification('Error loading featured campaigns: ' + error.message, 'error');
    }
}

/**
 * Handle search form submission
 * @param {Event} event - The form submit event
 */
function handleSearch(event) {
    event.preventDefault();
    
    const searchQuery = document.getElementById('search-input').value.trim();
    
    if (searchQuery) {
        window.location.href = `/search-results.html?q=${encodeURIComponent(searchQuery)}`;
    }
}

/**
 * Setup category filters
 */
function setupCategoryFilters() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    if (categoryFilters.length > 0) {
        categoryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.category;
                window.location.href = `/category.html?category=${encodeURIComponent(category)}`;
            });
        });
    }
}

/**
 * Setup scroll to top button
 */
function setupScrollToTop() {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    
    if (scrollToTopBtn) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Calculate time remaining until deadline
 * @param {string} deadlineString - ISO date string for deadline
 * @returns {Object} Object containing days, hours, minutes remaining
 */
function calculateTimeRemaining(deadlineString) {
    const deadline = new Date(deadlineString);
    const now = new Date();
    
    // If deadline has passed, return zeros
    if (deadline <= now) {
        return { days: 0, hours: 0, minutes: 0 };
    }
    
    const totalSeconds = Math.floor((deadline - now) / 1000);
    
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    
    return { days, hours, minutes };
}

/**
 * Get URL parameters
 * @param {string} param - Parameter name to get
 * @returns {string|null} Parameter value or null if not found
 */
function getUrlParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
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

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Convert file to Base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} Promise resolving to Base64 string
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        formatDate,
        calculateTimeRemaining,
        getUrlParameter,
        showNotification,
        isValidEmail,
        truncateText,
        fileToBase64
    };
}
