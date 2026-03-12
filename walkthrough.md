# Walkthrough - API-Driven ADAS Dashboard

The ADAS dashboard has been converted from a static dummy-data demo into a fully functional, real-time API-driven system.

## Changes Made

### 1. Backend API Infrastructure
Created a robust set of REST APIs to handle vehicle telemetry, device status, and real-time logs.

*   **Vehicle Data**: `POST /api/vehicle/data` stores telemetry (Battery SOC, Voltage, Temperature, GPS, Speed, RPM).
*   **Device Status**: `POST /api/device/status` updates real-time connectivity state.
*   **System Logs**: `POST /api/logs` captures real-time diagnostic information.
*   **Frontend Endpoints**: Added `GET` endpoints for the latest data, historical trends, and device listings.

### 2. Database Integration
All incoming data is now stored in the MongoDB Atlas database provided. The `DeviceData` and [Device](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/controllers/deviceController.js#3-25) models were updated to support the new fields.

### 3. Frontend Real-Time Sync & Decoupling
*   **Dummy Removal**: Removed all dummy data generation and fake polling from [Dashboard.jsx](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/frontend/src/pages/Dashboard.jsx).
*   **Live Polling**: Implemented a polling mechanism that fetches live telemetry every 3 seconds.
*   **Environment Aware**: All frontend pages now use dynamic API URLs, making it easy to switch between local development and production.
*   **Public Access**: Dashboards and telemetry data are now accessible without logging in, allowing for quick testing and hardware integration.

## How to Test with Postman

### 1. Store Vehicle Data
**Endpoint**: `POST http://localhost:5000/api/vehicle/data`
**Body (JSON)**:
```json
{
  "deviceId": "DEVICE_001",
  "batterySOC": 92,
  "batteryVoltage": 12.6,
  "batteryTemperature": 28.5,
  "ignitionStatus": "ON",
  "gpsLatitude": 20.2961,
  "gpsLongitude": 85.8245,
  "speed": 65,
  "engineRPM": 2200
}
```

### 2. Update Device Status
**Endpoint**: `POST http://localhost:5000/api/device/status`
**Body (JSON)**:
```json
{
  "deviceId": "DEVICE_001",
  "status": "Online"
}
```

### 3. Store Real-time Log
**Endpoint**: `POST http://localhost:5000/api/logs`
**Body (JSON)**:
```json
{
  "deviceId": "DEVICE_001",
  "message": "System initialized successfully",
  "level": "INFO"
}
```
