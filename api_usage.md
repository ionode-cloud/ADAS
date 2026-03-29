# How to Change GPS Location through API

To change or update the GPS location in the ADAS project, you can use the following API endpoints. The system uses these to track real-time position and store it in the device data history.

## 1. Primary Data Update (ESP32 / IoT Device)

This is the standard endpoint used by hardware devices to report GPS and other sensor data.

- **Endpoint**: `POST /api/device-data`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "deviceId": "YOUR_DEVICE_ID",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "ignition": "ON",
  "speed": 60,
  "batterySOC": 85
}
```

## 2. Vehicle-Specific Data Update

Alternatively, you can use the vehicle-specific endpoint which maps directly to the vehicle tracking schema.

- **Endpoint**: `POST /api/vehicle/data`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "deviceId": "YOUR_DEVICE_ID",
  "gpsLatitude": 28.6139,
  "gpsLongitude": 77.2090,
  "speed": 60,
  "engineRPM": 2500,
  "batterySOC": 85
}
```

## 3. Registering a Device with a Static Location

If you want to change the "Home" or "Static" location of the device itself (not the real-time GPS), you set this when adding the device.

- **Endpoint**: `POST /api/devices`
- **Content-Type**: `application/json`

### Request Body
```json
{
  "deviceName": "Vehicle 1",
  "deviceId": "V001",
  "location": "New Delhi, India"
}
```

---

### Verification
You can verify the location change by:
1.  **Fetching via Latest Data**: `GET /api/vehicle/latest?deviceId=YOUR_DEVICE_ID`
2.  **Checking History**: `GET /api/history/YOUR_DEVICE_ID`
3.  **Real-time Updates**: If you have the dashboard open, it will receive the new location via Socket.io automatically.
