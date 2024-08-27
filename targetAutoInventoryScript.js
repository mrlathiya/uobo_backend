const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const dealerId = '66c22d3fb25f629f8f050972';
const carServices = require('./services/car');

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
        const form = new FormData();
        form.append('dealerId', dealerId);
        form.append('inventory_csv', fs.createReadStream(localFilePath));

        // Send the API request
        try {
            const response = await axios.put('https://api.uobo.ca/api/dealer/update-inventory', form, {
                headers: {
                    ...form.getHeaders()
                }
            });

            console.log('API response:', response.data);
        } catch (apiError) {
            console.error('Error sending API request:', apiError);
        }

        // Clean up the temporary file
        fs.unlink(localFilePath, (unlinkErr) => {
            if (unlinkErr) {
                console.error('Error deleting the temporary file:', unlinkErr);
            } else {
                console.log('Temporary file deleted');
            }
        });
    } catch (err) {
        console.error('FTP operation failed:', err);
    } finally {
        client.close();
    }
}

fetchAndProcessCSV();
