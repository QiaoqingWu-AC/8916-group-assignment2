# Azure Stream Analytics job settings and queries

## 1. Create a Stream Analytics Job

![StreamAnalyticsJob](./StreamAnalyticsJob.png)

## 2. Add an input

- **Go to inputs section and add an input, take note of the config.**

![newInput](./newInput.png)

## 3. Follow steps in Azure-Blob-Storage.md before continuing to create Storage account & Container

## 4. Add an output

- **Go to outputs section and add an output, take note of config.**
- **Choose the storage account you made.**

![newOutput](./newOutput.png)

## 5. Make a query

- **Go to the query tab and replace the query with the following:**
'SELECT
    IoTHub.ConnectionDeviceId AS DeviceId,
    AVG(iceThickness) AS AvgIceThickness,
    AVG(surfaceTemperature) AS AvgSurfaceTemp,
    System.Timestamp AS EventTime
INTO
    [output1001]
FROM
    [iothub1001]
GROUP BY
    IoTHub.ConnectionDeviceId, TumblingWindow(second, 60)'

- **This query will calculate the average ice thickness & average surface temperature**

## 6. Test the query

![QueryAndOutput](./QueryAndOutput.png)

## 7. Start the job