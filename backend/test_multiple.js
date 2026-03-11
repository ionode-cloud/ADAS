const axios = require('axios');

async function testMultipleDashboards() {
    try {
        console.log("==> Testing Multiple Dashboards Login Flow <==");
        
        // 1. Create Dashboard 1
        console.log("Creating Dashboard 1...");
        await axios.post('http://localhost:5000/api/dashboards/public', {
            dashboardName: "Test Dashboard A",
            deviceId: "DEV-A",
            email: "multitest@example.com",
            password: "password123",
            enabledFeatures: ["ignition"]
        });
        
        // 2. Create Dashboard 2 (Same User)
        console.log("Creating Dashboard 2 (Same User)...");
        await axios.post('http://localhost:5000/api/dashboards/public', {
            dashboardName: "Test Dashboard B",
            deviceId: "DEV-B",
            email: "multitest@example.com",
            password: "password123",
            enabledFeatures: ["batterySOC"]
        });

        // 3. Login as that user
        console.log("Logging in...");
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: "multitest@example.com",
            password: "password123"
        });
        
        const token = loginRes.data.token;
        console.log("Logged in successfully. Token received.");

        // 4. Fetch Dashboards
        console.log("Fetching Dashboards...");
        const dashRes = await axios.get('http://localhost:5000/api/dashboards', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`Fetched ${dashRes.data.length} dashboards.`);
        dashRes.data.forEach((d, i) => {
            console.log(`  ${i+1}: ${d.dashboardName} (${d.deviceId})`);
        });

    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testMultipleDashboards();
