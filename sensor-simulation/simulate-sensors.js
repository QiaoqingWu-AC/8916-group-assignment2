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