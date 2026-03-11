const axios = require('axios');

async function verifyRBAC() {
    try {
        console.log("==> Testing RBAC Constraints <==");
        
        // 1. Try to fetch devices without a token (should fail)
        console.log("\n[1] Fetching devices directly without token (Expected: 401)...");
        try {
            await axios.get('http://localhost:5000/api/devices');
        } catch (err) {
            console.log("Result:", err.response?.status, err.response?.data?.message);
        }

        // 2. Try to hit the old public route (should fail)
        console.log("\n[2] Hitting removed /public dashboard creation route (Expected: 404)...");
        try {
            await axios.post('http://localhost:5000/api/dashboards/public', { dashboardName: "Test" });
        } catch (err) {
            console.log("Result:", err.response?.status, err.response?.statusText);
        }

        console.log("\nWait for full E2E frontend/backend validation to proceed manually or via script.");

    } catch (err) {
        console.error("Critical Test Error:", err.message);
    }
}

verifyRBAC();
