const cron = require('node-cron');
const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const dealerId = '66c22d3fb25f629f8f050972';

const convertAutoTradeCsvToJson = async (csvFile, dealerId) => {
    const csvData = csvFile.buffer.toString('utf-8');
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',').map(header => header.replace(/"/g, '').trim());
    // await carServices.deleteCarByDealerId(dealerId);

    let jsonData = [];
    console.log(headers);

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].split(',');

        console.log(row);

        // Skip empty rows
        if (row.every(field => field.trim() === '')) {
            continue;
        }

        const fullRow = row.join('');

        // Extract URLs using a regular expression
        const urlPattern = /https?:\/\/[^\s"']+/g;
        const photoUrls = fullRow.match(urlPattern);

        // Split the long string key in rowData
        const rawData = {};
        const keys = headers[0].split('|');
        const values = row[0].split('|');
        
        keys.forEach((key, index) => {
            rawData[key.trim()] = values[index] ? values[index].trim() : '';
        });

        let carData = {
            VIN: rawData['Vin'],
            Stock_Number: rawData['StockNumber'],
            New_or_Used: rawData['Status'],
            MSRP: rawData['Price'],
            Year: rawData['Year'],
            Make: rawData['Make'],
            Model: rawData['Model'],
            Body_Style: rawData['Body'],
            Series: rawData['Trim'],
            Exterior_Colour: rawData['Exterior Color'],
            Interior_Colour: rawData['Interior Color'],
            Trim: rawData['Trim'],
            Engine_Size: rawData['Engine Size'],
            Cylinder_Count: rawData['Cylinder'],
            Door_Count: rawData['Doors'],
            Drive_configuration: rawData['Drive'],
            Additional_Options: rawData['Options'],
            Current_Miles: rawData['KMS'],
            Date_Added_to_Inventory: rawData['CreatedDate'],
            Status: rawData['Status'],
            Fuel_Type: rawData['FuelType'],
            Vehicle_Location: rawData['CompanyName'],
            Certified_Pre_owned: rawData['Certified_Pre_owned'],
            Price: rawData['Price'],
            Transmission_Description: rawData['Transmission'],
            Internet_Description: rawData['AdDescription'],
            Vehicle_Class: rawData['Category'],
            Main_Photo: rawData['MainPhoto'] ? rawData['MainPhoto'] : photoUrls ? photoUrls[0] : '',
            Main_Photo_Last_Modified_Date: rawData['ModifiedDate'],
            Extra_Photos: rawData['OtherPhoto'] ? rawData['OtherPhoto'] : photoUrls ? photoUrls.slice(1).join(';') : '',
            Extra_Photo_Last_Modified_Date: rawData['ModifiedDate'],
            dealerId: dealerId,
        };

        jsonData.push(carData);

        // await addCSVRawToDB(carData, dealerId);
    }

    return jsonData;
    // return headers;
};

const fetchAndProcessCSV = async () => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        // Connect to the FTP server
        await client.access({
            host: 'ftp1.trader.com',
            user: 'ONCE_UB_TAC',
            password: '2-BUc}^uft6G',
            secure: false
        });

        // Define the file path on the FTP server
        const remoteFilePath = 'Transformed5051.csv';

        // Define the local path to save the file temporarily
        const localFilePath = path.join(__dirname, 'temp-Transformed5051.csv');

        // Download the file from the FTP server
        await client.downloadTo(localFilePath, remoteFilePath);
        console.log('File downloaded successfully');

        // Read the downloaded CSV file and process it
        fs.readFile(localFilePath, 'utf8', async (err, data) => {
            if (err) {
                console.error('Error reading the file:', err);
                return;
            }

            // Run your processing script with the CSV data
            const csvFile = {
                buffer: Buffer.from(data)
            };

            try {
                const result = await convertAutoTradeCsvToJson(csvFile, dealerId);
                console.log(result);

                return result;
            } catch (processingError) {
                console.error('Error processing CSV data:', processingError);
            }

            // Clean up the temporary file
            fs.unlink(localFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting the temporary file:', unlinkErr);
                } else {
                    console.log('Temporary file deleted');
                }
            });
        });
    } catch (err) {
        console.error('FTP operation failed:', err);
    } finally {
        client.close();
    }
}

fetchAndProcessCSV();

// Schedule the task to run every day at 12 AM
// cron.schedule('0 0 * * *', () => {
//     console.log('Running fetchAndProcessCSV at 12 AM');
//     fetchAndProcessCSV();
// });
