# 8916 Group 6: Assignment 2
Group Member List
- Gao, Yue - 040895157
- Watson-Danis, Caleb - 041041241
- Wu, Qiaoqing - 041076817
## Scenario Description
### 1. Overview:
The Rideau Canal Skateway in Ottawa is the world’s largest outdoor ice skating rink, attracting many visitors during the winter. To keep skaters safe, it's important to constantly monitor the ice conditions. Things like temperature, ice thickness, and weather can change quickly, and these changes affect whether the ice is safe to skate on.

### 2. Problem Addressed by the Solution:
The problem is that it's difficult to continuously monitor the ice conditions along such a large area. If the ice gets too thin or the weather becomes dangerous, it can be unsafe for skaters. Without a system to track these changes in real time, accidents could happen.

### 3. The Solution Overview:
The solution is to build a real-time monitoring system that:
  - Simulates sensors to track ice and weather conditions along the canal.
  - IoT sensors pushing simulated data to Azure IoT Hub.
  - Proccess and analyzes the incoming data using Azure Stream Analytics to check if the conditions are safe or dangerous.
  - Stores the data in Azure Blob Storage for future analysis and reporting.

## System Architecture
![diagram](./architecture-diagram.png)

## Implementation Details
### Part 1: IoT Sensor Simulation
#### 1. How the simulated IoT sensors generate and send data to Azure IoT Hub.
The simulated IoT sensors generate data using a script that mimics the real-world behavior of physical sensors. Each simulated sensor is associated with a specific location on the Rideau Canal (e.g., Dow's Lake, Fifth Avenue, NAC). The script generates random values for key data such as:
  - Ice Thickness (cm): Ranges from 20 to 50.
  - Surface Temperature (°C): Ranges from -5 to 5, formatted to one decimal place.
  - Snow Accumulation (cm): Ranges from 5 to 30.
  - External Temperature (°C): Ranges from -10 to 5, formatted to one decimal place.
  - Timestamp: The current date and time in ISO format.<br>

The script uses the Azure IoT SDK for Node.js to send messages to Azure IoT Hub. Here's a breakdown steps:
  - Connection Setup
    - The script authenticates with Azure IoT Hub using a device connection string, which is unique for each registered IoT device.
  - IoT Hub Client
    - A client object is created using the `azure-iot-device` and `azure-iot-device-mqtt` libraries, enabling secure communication with the IoT Hub.
  - Message Sending
    - The generated data is encapsulated in a `Message` object.
    - Each message is sent to Azure IoT Hub using the `sendEvent()` method.
    - The process is repeated at regular intervals, e.g., every 10 seconds.

#### 2. Structure of the JSON payload:
```json
{
  "location": "Dow's Lake",
  "iceThickness": 27,
  "surfaceTemperature": -1.4,
  "snowAccumulation": 8,
  "externalTemperature": -4.2,
  "timestamp": "2024-12-02T12:00:00Z"
}
```

#### 3. Scripts to simulate IoT sensors at three key locations on the Rideau Canal (e.g., Dow's Lake, Fifth Avenue, NAC):
```javascript
const { Client } = require('azure-iot-device');
const { Mqtt } = require('azure-iot-device-mqtt');
const { Message } = require('azure-iot-device');

// List of three devices' connection string
const CONNECTION_STRINGS = {
  "Dow's Lake": "ConnectionStringForDL",
  "Fifth Avenue": "ConnectionStringForFA",
  "NAC": "ConnectionStringForNAC"
};

// List of location to simulate
const LOCATIONS = ["Dow's Lake", "Fifth Avenue", "NAC"];

// Create IoT Hub clients for each device
const clients = Object.keys(CONNECTION_STRINGS).map(location => {
  const client = Client.fromConnectionString(CONNECTION_STRINGS[location], Mqtt);
  return { location, client };
});

// Function to generate random sensor data
function generateSensorData(location) {
  return {
    location,
    iceThickness: Math.floor(Math.random() * (50 - 20 + 1) + 20), // random between 20-50cm
    surfaceTemperature: parseFloat((Math.random() * (5 - (-5)) + (-5)).toFixed(1)), // random between -5 to 5°C with 1 decimal place
    snowAccumulation: Math.floor(Math.random() * (30 - 5 + 1) + 5), // random between 5-30 cm
    externalTemperature: parseFloat((Math.random() * (5 - (-10)) + (-10)).toFixed(1)), // random between -10 to 5 °C with 1 decimal place
    timestamp: Date().toString() // local timestamp
  };
}

// Function to send sensor data for all locations
function sendSensorData() {
  clients.forEach(({ location, client }) => {
    const data = generateSensorData(location);
    // put message into JSON format
    const message = new Message(JSON.stringify(data));
    // show data in console log
    console.log(`Sending data from ${location}: ${JSON.stringify(data)}`);
    client.sendEvent(message, (err) => {
      if (err) {
        console.error(`Failed to send data from ${location}: ${err.toString()}`);
      } else {
        console.log(`Message sent for location: ${location}`);
      }
    })
  });
}

// Main function
async function main() {
  try {
    console.log("Connecting to IoT Hub ...");
    // Open connections for all clients
    await Promise.all(clients.map(({ client }) => client.open()));
    console.log("Connected to IoT Hub. Starting simulation ...");
    
    // send data every 10 seconds (10000 milliseconds)
    setInterval(() => {
      sendSensorData();
    }, 10000);
  } catch (err) {
    console.error(`Error: ${err.toString()}`);
  }

  // disconnect and exit when receive signal
  process.on('SIGINT', async () => {
    console.log("Disconnecting from IoT Hub ...");
    // Close connections for all clients
    await Promise.all(clients.map(({ client }) => client.close()));
    console.log("Disconnected. Exiting ...");
    process.exit();
  });
}

main();
```

### Part 2: Azure IoT Hub Configuration
#### 1. Create IoT Hub:
  - Go to the Azure Portal, search for **"IoT Hub"**, and click **Create**.
  - Fill in details like name, subscription (e.g., Azure for Students), resource group, and region (e.g., EAST US).
  - Choose the **Free Tier** for testing.
#### 2. Register Devices:
  - In the IoT Hub, go to **Devices** and click **Add Device**.
  - Provide a name for the device (e.g., Sensor1) and click **Save**.
  - Open the created device and copy the **Connection String** for later use in the simulation script.
  - Create three **Devices** in total indicating three locations on the Rideau Canal Skateway.
#### 3. Set Up Endpoints:
  - Azure IoT Hub has a default endpoint called `messages/events`. This is where incoming device data is routed by default.
#### 4. Configure Message Routing:
  - In the IoT Hub settings, go to **Message Routing**.
  - Add a new route to direct messages to other Azure services, such as Azure Blob Storage or Stream Analytics.

### Part 3: Azure Stream Analytics Job
#### 1. Create a Stream Analytics Job:
  - In the Azure Portal, search for **"Stream Analytics Job"** and click **Create**.
  - Provide a name, subscription (e.g., Azure for Students), resource group, and region (e.g., EAST US).
#### 2. Input Source:
  - Go to **Input**, choose **Add input**->**IoT Hub** and select the IoT Hub you created earlier.
  - Use the default consumer group or create a new one.
#### 3. SQL query used for data processing:
```sql
SELECT
    IoTHub.ConnectionDeviceId AS DeviceId,
    ROUND(AVG(iceThickness), 1) AS AvgIceThickness,
    ROUND(AVG(surfaceTemperature), 1) AS AvgSurfaceTemp,
    System.Timestamp AS EventTime
INTO
    [output1001]
FROM
    [iothub1001]
GROUP BY
    IoTHub.ConnectionDeviceId, TumblingWindow(second, 60)
```
#### 4. Output Destination:
  - Go to "Outputs", and add an **Azure Blob Storage** output.
  - Select storage account and container.
  - Choose **JSON** as the output format.

### Part 4: Azure Blob Storage
#### 1. How the processed data is organized.
  - Processed data is stored in a folder structure:
  ```sql
  sensor-data/{deviceId}/{date}/{time}
  ```
  - Example: `/sensor-data/DowsLake/2024/12/02/ice-data.json`
  - Use descriptive names as file naming convention: `surface-temp-2024-12-02T00:00.json`
#### 2. Data Format:
  - Store data in **JSON** format for structure and readability:
  ```json
  {
    "DeviceId": "DowsLake",
    "AvgIceThickness": 28.5,
    "AvgSurfaceTemp": -1.3,
    "EventTime": "2024-12-02T12:00:00Z"
  }
  ```

## Usage Instructions
### Step 1: Running the IoT Sensor Simulation:
Step-by-step instructions for running the simulation script and Azure IoT Hub configuration
#### 1. Clone the Repository
```bash
git clone https://github.com/QiaoqingWu-AC/8916-group-assignment2.git
cd sensor-simulation
```
#### 2. Install Dependencies
```bash
npm install azure-iot-device azure-iot-device-mqtt
```                       
#### 3. Configure the Connection String
Replace `ConnectionStringForDL`, `ConnectionStringForFA`, and `ConnectionStringForNAC` in script `simulate-sensor.js` with the **Device Connection String** copied from Azure IoT Hub.
```javascript
// List of three devices' connection string
const CONNECTION_STRINGS = {
  "Dow's Lake": "ConnectionStringForDL",
  "Fifth Avenue": "ConnectionStringForFA",
  "NAC": "ConnectionStringForNAC"
};
```
#### 4. Run the Script to start simulating data
The script will generate and send simulated sensor data to Azure IoT Hub every 10 seconds, and console logs indicating the data being sent.
```bash
node simulate-sensor.js
```

### Step 2: Configuring Azure Services
#### 1. Set Up IoT Hub
  - Open the Azure Portal, search for "IoT Hub," and create a new instance.
  - Register three devices in the IoT Hub and copy their connection strings.
#### 2. Create and Run Stream Analytics Job
  - Go to the Azure Portal, search for "**Stream Analytics Jobs**" and create a new job.
  - Add **IoT Hub** as the input source and configure the consumer group.
  - Open the **Query Editor** and used the provided query.
  - Add **Blob Storage** as the output destination.
  - Click **Start** to begin processing incoming data.

### Step 3: Accessing Stored Data
Follow these steps to locate and view the processed data in Azure Blob Storage:
#### 1. Open Azure Blob Storage
  - Navigate to the storage account in the Azure Portal.
  - Go to the **Containers** section and open the container used as the Stream Analytics
#### 2. Locate Processed Data
  - Browse the folder structure for devices like: `/sensor-data/DowsLake/2024/12/02/`.
#### 3. Download or View Files
  - Select a file (e.g., `ice-data-2024-11-23T00:00.json`) to download or view.
  - The files are stored in **JSON** format, which can be opened with a text editor or a JSON viewer.

## Results
### Key Findings
#### Average Ice Thickness
Aggregated every 60 seconds for each location:
  - Dow's Lake: 33.2 cm
  - Fifth Avenue: 33.8 cm
  - NAC: 37.8 cm
#### Average Surface Temperature
  - Dow's Lake: -0.2 °C
  - Fifth Avenue: -0.6 °C
  - NAC: 2.3 °C

### Sample Output Files in Blob Storage
The sampleOutputFile.json is uploaded to this repo as well. 
```json
{"DeviceId":"DowsLakeSensor","AvgIceThickness":33.2,"AvgSurfaceTemp":-0.2,"EventTime":"2024-12-02T21:57:00.0000000Z"}
{"DeviceId":"NACSensor","AvgIceThickness":33.8,"AvgSurfaceTemp":-0.6,"EventTime":"2024-12-02T21:57:00.0000000Z"}
{"DeviceId":"5thAveSensor","AvgIceThickness":37.8,"AvgSurfaceTemp":2.3,"EventTime":"2024-12-02T21:57:00.0000000Z"}
{"DeviceId":"DowsLakeSensor","AvgIceThickness":38.0,"AvgSurfaceTemp":-0.7,"EventTime":"2024-12-02T21:58:00.0000000Z"}
{"DeviceId":"NACSensor","AvgIceThickness":34.3,"AvgSurfaceTemp":-0.8,"EventTime":"2024-12-02T21:58:00.0000000Z"}
{"DeviceId":"5thAveSensor","AvgIceThickness":42.5,"AvgSurfaceTemp":-2.0,"EventTime":"2024-12-02T21:58:00.0000000Z"}
```
## Reflection
### Simulating Multiple IoT Devices
- **Challenge:** Ensuring that each device sends unique data to Azure IoT Hub while maintaining a streamlined simulation script.
- **Solution:** Created three distinct devices in IoT Hub and used a single Node.js script to generate sensor data for all devices by looping through their connection strings.
### Azure IoT Hub Configuration
- **Challenge:** Configuring IoT Hub endpoints and ensuring messages from all devices were routed correctly to the Stream Analytics job.
- **Solution:** Verified device connection strings and used the default message routing. After testing using query in Stream Analytics confirmed that messages reached the job.
### Output Data to Blob Storage
- **Challenge:** After starting job, the output data did not successfully reach the specified container in Blob Storage.
- **Solution:** The pre-defined folder structure was not correctly aligned with the Storage Account and container name. After correcting the folder structure, the output data successfully reached the Blob Storage.