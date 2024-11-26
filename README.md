# 8916-group-assignment2
Group Member List
- Gao, Yue - 040895157
- Watson-Danis, Caleb - 041041241
- Wu, Qiaoqing - 041076817
## Scenario Description
Provide an overview of the Rideau Canal Skateway monitoring scenario and explain the problem your solution addresses.
## System Architecture
Include a clear diagram illustrating the data flow:
- IoT sensors pushing simulated data to Azure IoT Hub.
- Azure Stream Analytics processing the incoming data.
- Processed data being stored in Azure Blob Storage.
## Implementation Details
- **IoT Sensor Simulation**:
  - Describe how the simulated IoT sensors generate and send data to Azure IoT Hub.
  - Include the structure of the JSON payload and any scripts or applications used.
- **Azure IoT Hub Configuration**:
  - Explain the configuration steps for setting up the IoT Hub, including endpoints and message routing.
- **Azure Stream Analytics Job**:
  - Describe the job configuration, including input sources, query logic, and output destinations.
  - Provide sample SQL queries used for data processing.
- **Azure Blob Storage**:
  - Explain how the processed data is organized in Blob Storage (e.g., folder structure, file naming convention).
  - Specify the formats of stored data (JSON/CSV).
## Usage Instructions
- **Running the IoT Sensor Simulation**:
  - Provide step-by-step instructions for running the simulation script or application.
- **Configuring Azure Services**:
  - Describe how to set up and run the IoT Hub and Stream Analytics job.
- **Accessing Stored Data**:
  - Include steps to locate and view the processed data in Azure Blob Storage.
## Results
- Highlight key findings, such as: Aggregated data outputs (e.g. average ice thickness).
- Include references to sample output files stored in Blob Storage.
## Reflection
Discuss any challenges faced during implementation and how they were addressed.