const docusign = require('docusign-esign');
const fs = require('fs');
// const path = require('path');
const jwtConfig = require('./jwtConfig.json');

// const demoDocsPath = path.resolve(__dirname, '../config/demo_documents');
// const docFile = 'ordertest.pdf'; // Ensure this matches your actual file name
// const docFileName = 'ordertest';

const SCOPES = [
  'signature', 'impersonation'
];

async function authenticate() {
  const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
  const dsApi = new docusign.ApiClient();
  dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', ''));
  let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);

  try {
    const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
      jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
      jwtLifeSec);
    const accessToken = results.body.access_token;

    const userInfoResults = await dsApi.getUserInfo(accessToken);
    let userInfo = userInfoResults.accounts.find(account =>
      account.isDefault === 'true');

    return {
      accessToken: results.body.access_token,
      apiAccountId: userInfo.accountId,
      basePath: `${userInfo.baseUri}/restapi`
    };
  } catch (e) {
    console.error(`Authentication error: ${e}`);
    throw e;
  }
}

// Main function to orchestrate the signing process
async function main(signerEmail, signerName, placeholders, file, ccEmail, ccName) {
  try {

    // Authenticate and get account info
    let { accessToken, apiAccountId, basePath } = await authenticate();

    // Construct envelope definition
    let env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    // Read uploaded file content directly
    let docPdfBase64 = file.buffer.toString('base64');

    let docPdf = docusign.Document.constructFromObject({
      documentBase64: docPdfBase64,
      name: file.originalname, // Use the original file name
      fileExtension: 'pdf',
      documentId: '1'
    });

    env.documents = [docPdf];

    let signer1 = docusign.Signer.constructFromObject({
      email: signerEmail,
      name: signerName,
      ccEmail: ccEmail,
      ccName: ccName,
      recipientId: '1',
      routingOrder: '1'
    });

    // Dynamically add signHere tabs for each placeholder
    // let signHereTabs = placeholders.map((placeholder, index) => {
    //   return docusign.SignHere.constructFromObject({
    //     anchorString: `*${placeholder.label}*`,
    //     anchorXOffset: '0',
    //     anchorYOffset: '0',
    //     anchorUnits: 'inches',
    //     pageNumber: '1', // Page number where the placeholder is located
    //   });
    // });

    let signHereTabs = [];
    for (let i = 1; i <= 10; i++) { // Assuming up to 10 placeholders, adjust as needed
      signHereTabs.push(docusign.SignHere.constructFromObject({
        anchorString: `sign${i}`,
        anchorXOffset: '0',
        anchorYOffset: '0',
        anchorUnits: 'inches',
        pageNumber: '1', // Page number where the placeholder is located
      }));
    }

    let signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: signHereTabs
    });

    signer1.tabs = signer1Tabs;

    env.recipients = docusign.Recipients.constructFromObject({
      signers: [signer1]
    });

    env.status = 'sent';

    // Set up DocuSign API client and EnvelopesApi
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Create envelope using EnvelopesApi
    let results = await envelopesApi.createEnvelope(apiAccountId, { envelopeDefinition: env });
    let envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId: ${envelopeId}`);
    return envelopeId;
  } catch (error) {
    console.error('Error creating envelope:', error);
    throw error;
  }
}

module.exports = { main };
