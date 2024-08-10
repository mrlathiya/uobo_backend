const docusign = require('docusign-esign');
const fs = require('fs');
const jwtConfig = require('./jwtConfig.json');

const SCOPES = ['signature', 'impersonation'];

async function authenticate() {
  const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
  const dsApi = new docusign.ApiClient();
  dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', ''));
  const rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);

  try {
    const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
      jwtConfig.impersonatedUserGuid, SCOPES, rsaKey, jwtLifeSec);
    const accessToken = results.body.access_token;

    const userInfoResults = await dsApi.getUserInfo(accessToken);
    const userInfo = userInfoResults.accounts.find(account => account.isDefault === 'true');

    return {
      accessToken: results.body.access_token,
      apiAccountId: userInfo.accountId,
      basePath: `${userInfo.baseUri}/restapi`
    };
  } catch (e) {
    console.error(`Authentication error: ${e.response ? e.response.body : e}`);
    throw e;
  }
}

async function main(signerEmail, signerName, placeholders, file, ccEmail, ccName) {
  try {
    // Authenticate and get account info
    const { accessToken, apiAccountId, basePath } = await authenticate();

    // Construct envelope definition
    const env = new docusign.EnvelopeDefinition();
    env.emailSubject = 'Please sign this document';

    // Read uploaded file content directly
    const docPdfBase64 = file.buffer.toString('base64');

    const docPdf = docusign.Document.constructFromObject({
      documentBase64: docPdfBase64,
      name: file.originalname, // Use the original file name
      fileExtension: 'pdf',
      documentId: '1'
    });

    env.documents = [docPdf];

    const signer1 = docusign.Signer.constructFromObject({
      email: signerEmail,
      name: signerName,
      recipientId: '1',
      routingOrder: '1'
    });

    // Initialize tabs arrays
    let signHereTabs = [];
    let initialHereTabs = [];

    placeholders.forEach((placeholder, index) => {

      if (!placeholder || !placeholder.label) {
        console.error(`Invalid placeholder data at index ${index}`);
        return;
      }

      if (placeholder.label.startsWith('Sign')) {
        signHereTabs.push(docusign.SignHere.constructFromObject({
          anchorString: placeholder.label,
          anchorXOffset: '0',
          anchorYOffset: '0',
          anchorUnits: 'inches',
          pageNumber: placeholder.pageNumber.toString(),
        }));
      } else if (placeholder.label.startsWith('Init')) {
        initialHereTabs.push(docusign.InitialHere.constructFromObject({
          anchorString: placeholder.label,
          anchorXOffset: '0',
          anchorYOffset: '0',
          anchorUnits: 'inches',
          pageNumber: placeholder.pageNumber.toString(),
        }));
      } else {
        console.warn(`Unknown placeholder type at index ${index}`);
      }
    });

    const signer1Tabs = docusign.Tabs.constructFromObject({
      signHereTabs: signHereTabs,
      initialHereTabs: initialHereTabs
    });

    signer1.tabs = signer1Tabs;

    env.recipients = docusign.Recipients.constructFromObject({
      signers: [signer1]
    });

    env.status = 'sent';

    // Set up DocuSign API client and EnvelopesApi
    const dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accessToken);
    const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    // Create envelope using EnvelopesApi
    const results = await envelopesApi.createEnvelope(apiAccountId, { envelopeDefinition: env });
    const envelopeId = results.envelopeId;
    console.log(`Envelope was created. EnvelopeId: ${envelopeId}`);
    return envelopeId;
  } catch (error) {
    console.error('Error creating envelope:', error.response ? error.response.body : error);
    throw error;
  }
}


module.exports = { main };
