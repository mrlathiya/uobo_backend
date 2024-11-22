const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const dealerId = '66fd770c74a163de4912e859';

const fetchAndProcessCSV = async () => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        // Connect to the FTP server
        await client.access({
            host: '54.156.195.154',
            user: 'SevenSeas',
            password: 'uobo7seas',
            secure: false
        });

        // Define the file path on the FTP server
        const remoteFilePath = 'sevenseasmotors.csv';

        // Define the local path to save the file temporarily
        const localFilePath = path.join(__dirname, 'temp-sevenseasmotors.csv');

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
