const axios = require('axios');

async function testPublic() {
    try {
        const res = await axios.post('http://localhost:5000/api/dashboards/public', {
            dashboardName: "Test Public Dashboard",
            deviceId: "DEV-001",
            email: "testpublic2@example.com",
            password: "password123",
            enabledFeatures: ["ignition", "batterySOC"]
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testPublic();
