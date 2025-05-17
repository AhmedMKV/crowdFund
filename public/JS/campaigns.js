// Base URL for API requests
const API_URL = 'http://localhost:3000';

// Sample campaign data
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
    {
        id: 2,
        title: "AI-Powered Learning Assistant",
        creator: "EduTech Innovations",
        description: "An AI-powered learning platform that adapts to each student's learning style, providing personalized tutoring and homework help. Features include real-time feedback, progress tracking, and interactive learning modules for K-12 students.",
        category: "technology",
        goal: 100000,
        currentAmount: 65000,
        backers: 189,
        deadline: "2025-9-15",
        image: "assets/images/tt.jpg"
    },
    {
        id: 3,
        title: "Smart City Traffic Management",
        creator: "Urban Tech Solutions",
        description: "An IoT-based traffic management system that uses real-time data to optimize traffic flow, reduce congestion, and improve emergency response times. The system includes smart traffic lights, mobile app integration, and predictive analytics.",
        category: "technology",
        goal: 200000,
        currentAmount: 150000,
        backers: 215,
        deadline: "2025-11-30",
        image: "assets/images/tq.JPEG"
    },
    {
        id: 4,
        title: "Blockchain Healthcare Records",
        creator: "MedChain Solutions",
        description: "A secure, decentralized platform for managing healthcare records using blockchain technology. Features include encrypted data storage, instant access for authorized medical professionals, and automated insurance claim processing.",
        category: "technology",
        goal: 150000,
        currentAmount: 75000,
        backers: 120,
        deadline: "2025-12-1",
        image: "assets/images/tech.JPG"
    },

    // Health & Wellness Category
    {
        id: 5,
        title: "Mental Health Mobile App",
        creator: "Wellness Tech",
        description: "A comprehensive mental health app providing accessible therapy, meditation guides, and mood tracking. Features include AI-powered mood analysis, virtual therapy sessions, and community support groups.",
        category: "health",
        goal: 60000,
        currentAmount: 35000,
        backers: 150,
        deadline: "2024-12-15",
        image: "assets/images/test.jpg"
    },
    {
        id: 6,
        title: "Rural Medical Clinic",
        creator: "Health Outreach",
        description: "Establishing a medical clinic in rural areas to provide essential healthcare services. The clinic will offer primary care, maternal health services, and health education programs for underserved communities.",
        category: "health",
        goal: 150000,
        currentAmount: 90000,
        backers: 200,
        deadline: "2024-12-10",
        image: "assets/images/test.jpg"
    },
    {
        id: 7,
        title: "Nutrition Education Program",
        creator: "Healthy Living Initiative",
        description: "A comprehensive nutrition education program for schools, teaching children about healthy eating habits, food preparation, and sustainable food choices. Includes interactive workshops and take-home materials.",
        category: "health",
        goal: 45000,
        currentAmount: 30000,
        backers: 120,
        deadline: "2024-12-20",
        image: "assets/images/test.jpg"
    },
    {
        id: 8,
        title: "Medical Research Fund",
        creator: "Health Research Institute",
        description: "Funding breakthrough research in rare diseases, focusing on developing new treatments and improving patient outcomes. The research will be conducted in collaboration with leading medical institutions.",
        category: "health",
        goal: 200000,
        currentAmount: 120000,
        backers: 180,
        deadline: "2024-12-25",
        image: "assets/images/test.jpg"
    },

    // Infrastructure Category
    {
        id: 9,
        title: "Solar Power Community",
        creator: "Green Energy Solutions",
        description: "Installing solar panels in a low-income community to provide clean, affordable energy. The project includes community education, job training, and maintenance programs.",
        category: "infrastructure",
        goal: 500000,
        currentAmount: 300000,
        backers: 250,
        deadline: "2024-12-20",
        image: "assets/images/test.jpg"
    },
    {
        id: 10,
        title: "Smart Water Management",
        creator: "Water Solutions",
        description: "Implementing smart water management systems in urban areas to reduce water waste and improve distribution efficiency. Features include leak detection, usage monitoring, and automated irrigation systems.",
        category: "infrastructure",
        goal: 300000,
        currentAmount: 180000,
        backers: 200,
        deadline: "2024-12-15",
        image: "assets/images/test.jpg"
    },
    {
        id: 11,
        title: "Public Transport Upgrade",
        creator: "City Transit Authority",
        description: "Modernizing public transportation with electric buses, smart ticketing systems, and real-time tracking. The project aims to reduce carbon emissions and improve commuter experience.",
        category: "infrastructure",
        goal: 400000,
        currentAmount: 250000,
        backers: 220,
        deadline: "2024-12-10",
        image: "assets/images/test.jpg"
    },
    {
        id: 12,
        title: "Digital Infrastructure",
        creator: "Tech Infrastructure",
        description: "Building high-speed internet infrastructure in rural areas to bridge the digital divide. The project includes fiber optic installation, community training, and public access points.",
        category: "infrastructure",
        goal: 150000,
        currentAmount: 90000,
        backers: 180,
        deadline: "2024-12-30",
        image: "assets/images/test.jpg"
    },

    // Education Category
    {
        id: 13,
        title: "STEM Education Center",
        creator: "Science Academy",
        description: "Creating a state-of-the-art STEM education center for underprivileged students. The center will provide hands-on learning experiences in science, technology, engineering, and mathematics.",
        category: "education",
        goal: 80000,
        currentAmount: 45000,
        backers: 180,
        deadline: "2024-12-15",
        image: "assets/images/test.jpg"
    },
    {
        id: 14,
        title: "Digital Library Project",
        creator: "Education First",
        description: "Establishing digital libraries in schools with tablets, e-books, and educational software. The project includes teacher training and ongoing technical support.",
        category: "education",
        goal: 50000,
        currentAmount: 30000,
        backers: 150,
        deadline: "2024-12-20",
        image: "assets/images/test.jpg"
    },
    {
        id: 15,
        title: "Teacher Training Program",
        creator: "Education Plus",
        description: "Providing advanced training for teachers in modern teaching methods and technology integration. The program includes workshops, online resources, and mentorship opportunities.",
        category: "education",
        goal: 60000,
        currentAmount: 35000,
        backers: 120,
        deadline: "2024-12-25",
        image: "assets/images/test.jpg"
    },
    {
        id: 16,
        title: "Scholarship Fund",
        creator: "Education Foundation",
        description: "Creating scholarships for deserving students to pursue higher education. The fund will support students from low-income families and underrepresented communities.",
        category: "education",
        goal: 150000,
        currentAmount: 90000,
        backers: 250,
        deadline: "2024-12-05",
        image: "assets/images/test.jpg"
    },

    // Environment Category
    {
        id: 17,
        title: "Urban Forest Project",
        creator: "Green Earth Initiative",
        description: "Creating urban forests in city centers to improve air quality and provide green spaces. The project includes tree planting, maintenance, and community engagement programs.",
        category: "environment",
        goal: 100000,
        currentAmount: 60000,
        backers: 200,
        deadline: "2024-12-15",
        image: "assets/images/test.jpg"
    },
    {
        id: 18,
        title: "Ocean Cleanup Initiative",
        creator: "Blue Ocean Project",
        description: "Deploying innovative technology to clean up ocean plastic pollution. The project includes beach cleanups, educational programs, and research on plastic waste reduction.",
        category: "environment",
        goal: 200000,
        currentAmount: 120000,
        backers: 250,
        deadline: "2024-12-20",
        image: "assets/images/test.jpg"
    },
    {
        id: 19,
        title: "Wildlife Conservation",
        creator: "Wildlife Trust",
        description: "Protecting endangered species and their habitats through conservation programs. The project includes habitat restoration, anti-poaching measures, and community education.",
        category: "environment",
        goal: 150000,
        currentAmount: 90000,
        backers: 180,
        deadline: "2024-12-10",
        image: "assets/images/test.jpg"
    },
    {
        id: 20,
        title: "Climate Research Fund",
        creator: "Climate Institute",
        description: "Funding research on climate change impacts and solutions. The project supports scientists studying renewable energy, carbon capture, and climate adaptation strategies.",
        category: "environment",
        goal: 300000,
        currentAmount: 180000,
        backers: 300,
        deadline: "2024-12-05",
        image: "assets/images/test.jpg"
    },

    // Arts & Culture Category
    {
        id: 21,
        title: "Community Arts Center",
        creator: "Arts Collective",
        description: "Building a community arts center for local artists and performers. The center will include exhibition spaces, performance venues, and educational facilities.",
        category: "arts",
        goal: 150000,
        currentAmount: 90000,
        backers: 180,
        deadline: "2024-12-15",
        image: "assets/images/test.jpg"
    },
    {
        id: 22,
        title: "Cultural Heritage Museum",
        creator: "Heritage Foundation",
        description: "Creating a museum to preserve and showcase local cultural heritage. The museum will feature interactive exhibits, educational programs, and community events.",
        category: "arts",
        goal: 200000,
        currentAmount: 120000,
        backers: 250,
        deadline: "2024-12-25",
        image: "assets/images/test.jpg"
    },
    {
        id: 23,
        title: "Youth Music Program",
        creator: "Sound Waves",
        description: "Establishing a music education program for underprivileged youth. The program provides instruments, lessons, and performance opportunities.",
        category: "arts",
        goal: 80000,
        currentAmount: 45000,
        backers: 120,
        deadline: "2024-12-10",
        image: "assets/images/test.jpg"
    },
    {
        id: 24,
        title: "Public Art Initiative",
        creator: "Creative Space",
        description: "Creating public art installations throughout the city to enhance community spaces. The project includes artist residencies, workshops, and guided tours.",
        category: "arts",
        goal: 100000,
        currentAmount: 60000,
        backers: 150,
        deadline: "2024-12-20",
        image: "assets/images/test.jpg"
    }
];

// Initialize the page
window.onload = function() {
    console.log('Page loaded, initializing campaigns...');
    
    // Force initialize campaigns in localStorage
    console.log('Initializing campaigns in localStorage...');
    localStorage.setItem('campaigns', JSON.stringify(sampleCampaigns));

    // Get category from URL parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    // Set the category filter if it exists in URL
    const categoryFilter = document.getElementById('categoryFilter');
    if (category && categoryFilter) {
        categoryFilter.value = category;
    }
    
    // Load campaigns
    loadCampaigns(category);
    
    // Add event listener for category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            const selectedCategory = e.target.value;
            loadCampaigns(selectedCategory);
            
            // Update URL with selected category
            const url = new URL(window.location);
            if (selectedCategory === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', selectedCategory);
            }
            window.history.pushState({}, '', url);
        });
    }
};

async function loadCampaigns(category = 'all') {
    console.log('Loading campaigns for category:', category);
    
    try {
        // Show loading state
        const container = document.getElementById('campaignsContainer');
        if (!container) {
            console.error('Campaigns container not found!');
            return;
        }
        
        container.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"></div></div>';
        
        // Load campaigns from localStorage
        let campaigns = JSON.parse(localStorage.getItem('campaigns')) || [];
        console.log('Loaded campaigns from localStorage:', campaigns.length);
        
        // If no campaigns in localStorage, initialize with sample data
        if (campaigns.length === 0) {
            console.log('No campaigns found, initializing with sample data...');
            campaigns = sampleCampaigns;
            localStorage.setItem('campaigns', JSON.stringify(sampleCampaigns));
        }
        
        // Filter by category if not 'all'
        if (category !== 'all') {
            campaigns = campaigns.filter(campaign => campaign.category === category);
            console.log('Filtered campaigns for category', category + ':', campaigns.length);
        }
        
        // Update page title
        const categoryTitle = document.querySelector('.category-title');
        if (categoryTitle) {
            if (category === 'all') {
                categoryTitle.textContent = 'All Campaigns';
            } else {
                const categoryNames = {
                    health: 'Health & Wellness',
                    infrastructure: 'Infrastructure',
                    technology: 'Technology',
                    education: 'Education',
                    environment: 'Environment',
                    arts: 'Arts & Culture'
                };
                categoryTitle.textContent = `${categoryNames[category] || category} Projects`;
            }
        }
        
        // Clear container
        container.innerHTML = '';
        
        if (campaigns.length === 0) {
            container.innerHTML = '<div class="col-12 text-center"><p>No campaigns found in this category.</p></div>';
            return;
        }
        
        // Sort campaigns by creation date (newest first)
        campaigns.sort((a, b) => new Date(b.createdAt || b.deadline) - new Date(a.createdAt || a.deadline));
        
        // Render campaigns
        campaigns.forEach(campaign => {
            console.log('Rendering campaign:', campaign.title);
            const campaignCard = createCampaignCard(campaign);
            container.appendChild(campaignCard);
        });
        
        console.log('Campaigns rendered successfully');
        
    } catch (error) {
        console.error('Error loading campaigns:', error);
        const container = document.getElementById('campaignsContainer');
        if (container) {
            container.innerHTML = '<div class="col-12 text-center"><p>Error loading campaigns. Please try again later.</p></div>';
        }
    }
}

function createCampaignCard(campaign) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const progress = (campaign.currentAmount / campaign.goal) * 100;
    const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    col.innerHTML = `
        <article class="campaign-card h-100">
            <figure class="campaign-image-wrapper mb-0 ratio ratio-16x9">
                <img src="${campaign.image || 'assets/images/test.jpg'}" class="img-fluid object-fit-cover" alt="${campaign.title}">
            </figure>
            <div class="campaign-body p-3">
                <h2 class="campaign-title h5">${campaign.title}</h2>
                <p class="campaign-creator small text-muted">By ${campaign.creator}</p>
                <p class="campaign-description">${campaign.description}</p>
                
                <div class="campaign-progress mb-2">
                    <div class="progress-text d-flex justify-content-between small">
                        <span>${Math.round(progress)}% funded</span>
                        <span class="progress-percent fw-bold">$${campaign.currentAmount.toLocaleString()} raised</span>
                    </div>
                    <div class="progress" style="height: 8px">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="campaign-stats d-flex justify-content-between small border-top pt-2 mt-2">
                    <div class="stat-item text-center">
                        <span class="stat-value d-block fw-bold">${campaign.backers}</span>
                        <span class="stat-label text-muted">Backers</span>
                    </div>
                    <div class="stat-item text-center">
                        <span class="stat-value d-block fw-bold">${daysLeft}</span>
                        <span class="stat-label text-muted">Days Left</span>
                    </div>
                </div>
                
                <a href="campaign.html?id=${campaign.id}" class="btn btn-primary w-100 mt-3">
                    <i class="fas fa-hand-holding-heart me-2"></i>Back This Project
                </a>
            </div>
        </article>
    `;
    
    return col;
} 