const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.use((req, res, next) => {
    if (req.method === 'POST') {
        req.body.createdAt = Date.now();
    }
    next();
});

// Custom middleware to handle PATCH requests
server.use((req, res, next) => {
    if (req.method === 'PATCH') {
        // Ensure the request has a body
        if (!req.body) {
            return res.status(400).json({ error: 'Request body is required' });
        }
    }
    next();
});

// Users endpoints
server.get('/users', (req, res) => {
    const users = router.db.get('users').value();
    res.json(users);
});

server.get('/users/:id', (req, res) => {
    const user = router.db.get('users')
        .find({ id: req.params.id })
        .value();
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
});

server.patch('/users/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const user = router.db.get('users')
        .find({ id })
        .value();
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user
    const updatedUser = { ...user, ...updates };
    router.db.get('users')
        .find({ id })
        .assign(updatedUser)
        .write();
    
    res.json(updatedUser);
});

// Campaigns endpoints
server.get('/campaigns4', (req, res) => {
    const campaigns = router.db.get('campaigns4').value();
    res.json(campaigns);
});

server.get('/campaigns4/:id', (req, res) => {
    const campaign = router.db.get('campaigns4')
        .find({ id: req.params.id })
        .value();
    
    if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
});

server.patch('/campaigns4/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const campaign = router.db.get('campaigns4')
        .find({ id })
        .value();
    
    if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Update campaign
    const updatedCampaign = { ...campaign, ...updates };
    router.db.get('campaigns4')
        .find({ id })
        .assign(updatedCampaign)
        .write();
    
    res.json(updatedCampaign);
});

server.delete('/campaigns4/:id', (req, res) => {
    const { id } = req.params;
    
    const campaign = router.db.get('campaigns4')
        .find({ id })
        .value();
    
    if (!campaign) {
        return res.status(404).json({ error: 'Campaign not found' });
    }
    
    // Delete campaign
    router.db.get('campaigns4')
        .remove({ id })
        .write();
    
    res.json({ message: 'Campaign deleted successfully' });
});

// Pledges endpoints
server.get('/pledges', (req, res) => {
    const pledges = router.db.get('pledges').value();
    res.json(pledges);
});

server.get('/pledges/:id', (req, res) => {
    const pledge = router.db.get('pledges')
        .find({ id: req.params.id })
        .value();
    
    if (!pledge) {
        return res.status(404).json({ error: 'Pledge not found' });
    }
    res.json(pledge);
});

// Use default router
server.use(router);

// Start server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`JSON Server is running on port ${PORT}`);
});
