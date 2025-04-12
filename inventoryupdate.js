const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// List of FTP configurations and corresponding API endpoints
const ftpConfigs = [
    {
        host: 'ftp.dealerpull.com',
        user: 'londonautovalley@dealerpull.com',
        password: 'iU?#rQ4y!hZc',
        remoteFilePath: 'inventory_328.csv',
        dealerId: '672a5bb453e291958a149599'
    },
    // {
    //     host: '54.156.195.154',
    //     user: 'SevenSeas',
    //     password: 'uobo7seas',
    //     remoteFilePath: 'sevenseasmotors.csv',
    //     dealerId: '66fd770c74a163de4912e859'
    // },
    {
        host: 'ftp1.trader.com',
        user: 'ONCE_UB_TAC',
        password: '2-BUc}^uft6G',
        remoteFilePath: 'Transformed5051.csv',
        dealerId: '66db783ba3f5dc72a6ed55c2'
    },
    // {
    //     host: '54.156.195.154',
    //     user: 'carmax',
    //     password: 'carMax',
    //     remoteFilePath: 'autobunny.csv',
    //     dealerId: '67634c511964d21b5ee22078'
    // }
];

const fetchAndProcessCSV = async (ftpConfig) => {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        // Connect to the FTP server
        await client.access({
            host: ftpConfig.host,
            user: ftpConfig.user,
            password: ftpConfig.password,
            secure: false
        });

        // Define the local path to save the file temporarily
        const localFilePath = path.join(__dirname, `temp-${path.basename(ftpConfig.remoteFilePath)}`);

        // Download the file from the FTP server
        await client.downloadTo(localFilePath, ftpConfig.remoteFilePath);
        console.log(`File downloaded successfully from ${ftpConfig.host}`);

        // Read the downloaded CSV file and process it
        const form = new FormData();
        form.append('dealerId', ftpConfig.dealerId);
        form.append('inventory_csv', fs.createReadStream(localFilePath));

        const API_URL = "http://107.23.254.68:8000/api/dealer/update-inventory";

        // Send the API request
        try {
            const response = await axios.put(API_URL, form, {
                headers: {
                    ...form.getHeaders()
                }
            });

            console.log(`API response for ${ftpConfig.host}:`, response.data);
        } catch (apiError) {
            console.error(`Error sending API request for ${ftpConfig.host}:`, apiError);
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
        console.error(`FTP operation failed for ${ftpConfig.host}:`, err);
    } finally {
        client.close();
    }
};

const processAllFtpServers = async () => {
    for (const config of ftpConfigs) {
        console.log(`Processing FTP server: ${config.host}`);
        await fetchAndProcessCSV(config);
    }
};

processAllFtpServers();
