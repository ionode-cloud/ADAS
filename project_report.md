# ADAS (Advanced Driver Assistance System) Web Platform
**Project Architecture & Implementation Report**

## 1. Project Overview
The ADAS Web Platform is a full-stack, real-time fleet management and telemetry tracking application. It is designed to allow administrators and standard users to monitor connected vehicles, view remote diagnostic data (battery state of charge, voltage, temperature, GPS location), manage system users, and visualize advanced collision-avoidance sensor data.

## 2. Technology Stack
**Frontend (Client-Side)**
* **Framework**: React.js bootstrapped with Vite for high-performance builds and hot module replacement (HMR).
* **Styling**: Tailwind CSS combined with custom CSS keyframes for complex UI animations and glassmorphism design.
* **Routing**: React Router DOM (`react-router-dom`) for secure, client-side protected routing.
* **Data Visualization**: ApexCharts (`react-apexcharts`) for historical telemetry line/area charts.
* **Mapping**: Leaflet & React-Leaflet integrated with CartoDB/OpenStreetMap tiles for live vehicle GPS tracking.
* **Icons**: Lucide React (`lucide-react`).

**Backend (Server-Side)**
* **Runtime**: Node.js.
* **Framework**: Express.js for building scalable RESTful APIs.
* **Database**: MongoDB hosted in the cloud, utilizing Mongoose ODMs for explicit schema definitions ([User](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/controllers/userController.js#4-15), [Device](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/controllers/deviceController.js#3-25), [Dashboard](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/frontend/src/pages/Dashboard.jsx#20-265)).
* **Authentication**: JSON Web Tokens (`jsonwebtoken`) paired with Bcrypt (`bcrypt`) for password hashing.
* **File Uploads**: Multer (`multer`) for potential media processing.

## 3. Core Features & Modules

### A. Secure Authentication & RBAC
* **JSON Web Tokens**: The application uses robust JWT authentication. Passwords are encrypted before storage.
* **Role-Based Access Control (RBAC)**: Users are divided strictly into [admin](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/middleware/authMiddleware.js#30-37) and `user` roles. 
* **Middleware Protection**: The Node.js backend features [protect](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/middleware/authMiddleware.js#4-29) and [admin](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/middleware/authMiddleware.js#30-37) wrappers. If a regular user attempts an admin-only REST call, the server forcefully aborts with a `403 Forbidden` status.

### B. Live Telemetry Dashboard
* **Real-time Simulation Engine**: The dashboard dynamically streams telemetry points using JavaScript intervals mimicking a live WebSocket/IoT pipeline.
* **KPI Metrics**: Displays Ignition Status, Battery SOC (%), Temperature (°C), and Voltage (V) with respective health indicators.
* **GPS Tracking**: A dynamic map automatically centers on the vehicle's real-time latitude/longitude coordinates.
* **Dashboard Selector**: Users can easily flip between different hardware profiles registered to their account natively from the top bar.

### C. Device & Hardware Provisioning
* **Device Registry**: Specific hardware IoT modules can be logged in the database by their `deviceId` and `particleId`.
* **Dashboard Binding**: Users can create customized software dashboard instances that bind to a specific physical device, choosing which features (e.g., OTA updates, Data Logging) are enabled on the portal.

### D. Administrative Control Panel
* **Centralized Management**: An exclusive interface hidden from standard users.
* **User Management System**: Admins can create new system personnel automatically (bypassing traditional verification). Admins can view, edit, or delete any system user.
* *Note*: Per administrative requirements, passwords for auto-generated users are currently viewable in plaintext by administrators, optimizing deployment speeds for local technicians.

### E. Proximity Radar Simulator (Car Sensor System)
* A dedicated ADAS UI that replicates real-world parking assist systems.
* **360° Detection**: Simulates 4-axis (Front, Rear, Left, Right) sensor data.
* **Animated Feedback**: Expanding CSS-based radar ripple animations emit from a central top-down vehicle vector.
* **Dynamic Color Scaling**:
  - 🟢 **Safe** (`> 1.5m`): Green ripples outputting nominal status.
  - 🟡 **Warning** (`0.7m - 1.5m`): Yellow ripples indicating caution.
  - 🔴 **Danger** (`<= 0.6m`): Red ripples triggering an immediate `STOP - COLLISION IMMINENT` visual alarm.

## 4. Application Architecture

```text
Robo Project / ADAS
├── backend/
│   ├── controllers/      # Business logic (Dashboard, Device, User, Auth)
│   ├── middleware/       # JWT verification & Admin RBAC layers
│   ├── models/           # Mongoose Data Schemas
│   ├── routes/           # Express REST API routing maps
│   └── server.js         # Entry point, Database connect & CORS config
│
└── frontend/
    ├── src/
    │   ├── components/   # Reusable UI fragments (Layout Sidebar structure)
    │   ├── pages/        # Core Views (Login, Dashboard, AdminPanel, CarSensorSystem)
    │   ├── App.jsx       # Top-level Routing & State wrapper
    │   ├── index.css     # Global styles & Tailwind injections
    │   └── main.jsx      # React DOM hydration
    ├── index.html
    ├── vite.config.js    # Bundler configurations
    └── tailwind.config.js
```

## 5. Security & Limitations
* Currently, user verification emails and initial OTP setups have been temporarily bypassed to accommodate rapid administrative onboarding.
* [admin](file:///c:/Users/jyoti/Desktop/Currently%20Working/Robo%20Project/ADAS/backend/middleware/authMiddleware.js#30-37) role elevation logic is strictly server-authoritative, ensuring frontend manipulations cannot grant elevated privileges.
