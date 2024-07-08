const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();

const jwtConfig = require('./jwtConfig.json');
const demoDocsPath = path.resolve(__dirname, '../config/demo_documents');
const docFile = 'harshtest.pdf'; // The document uploaded by the dealer

const SCOPES = [
  'signature', 'impersonation'
];

async function authenticate() {
    const jwtLifeSec = 10 * 60;
    const dsApi = new docusign.ApiClient();
    dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', ''));
    const rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);
  
    try {
      const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
        jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
        jwtLifeSec);
      const accessToken = results.body.access_token;
  
      const userInfoResults = await dsApi.getUserInfo(accessToken);
      const userInfo = userInfoResults.accounts.find(account =>
        account.isDefault === 'true');
  
      return {
        accessToken: results.body.access_token,
        apiAccountId: userInfo.accountId,
        basePath: `${userInfo.baseUri}/restapi`
      };
    } catch (e) {
      console.error(e);
      const body = e.response && e.response.body;
  
      if (body && body.error === 'consent_required') {
        if (getConsent()) { return authenticate(); }
      } else {
        console.error(`API problem: Status code ${e.response.status}, message body: ${JSON.stringify(body, null, 4)}`);
      }
    }
  }
  
  function getConsent() {
    const urlScopes = SCOPES.join('+');
    const redirectUri = 'https://developers.docusign.com/platform/auth/consent';
    const consentUrl = `${jwtConfig.dsOauthServer}/oauth/auth?response_type=code&` +
      `scope=${urlScopes}&client_id=${jwtConfig.dsJWTClientId}&` +
      `redirect_uri=${redirectUri}`;
  
    console.log('Open the following URL in your browser to grant consent to the application:');
    console.log(consentUrl);
    console.log('Consent granted? \n 1)Yes \n 2)No');
    const consentGranted = prompt('');
    if (consentGranted === '1') {
      return true;
    } else {
      console.error('Please grant consent!');
      process.exit();
    }
  }
  
  async function createDraftEnvelope() {
    try {
        const accountInfo = await authenticate();
        const dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(accountInfo.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accountInfo.accessToken);
    
        const envelopeDefinition = new docusign.EnvelopeDefinition();
        envelopeDefinition.emailSubject = 'Please review and add placeholders';
    
        const documentBytes = fs.readFileSync(path.resolve(demoDocsPath, docFile));
        const documentBase64 = Buffer.from(documentBytes).toString('base64');
    
        const document = docusign.Document.constructFromObject({
        documentBase64: documentBase64,
        name: 'Document', // Name of the document
        fileExtension: 'pdf', // Extension of the document
        documentId: '1'
        });
    
        // Define a recipient
        const signer = docusign.Signer.constructFromObject({
        email: 'uobo.drive@gmail.com', // Dealer's email
        name: 'Uobo', // Dealer's name
        recipientId: '1',
        clientUserId: '1000' // Unique ID for the dealer
        });
    
        // Define a signHere tab for the recipient
        const signHere = docusign.SignHere.constructFromObject({
        anchorString: '/sn1/',
        anchorYOffset: '0',
        anchorUnits: 'pixels',
        anchorXOffset: '0'
        });
    
        signer.tabs = docusign.Tabs.constructFromObject({
        signHereTabs: [signHere]
        });
    
        envelopeDefinition.documents = [document];
        envelopeDefinition.recipients = docusign.Recipients.constructFromObject({
        signers: [signer]
        });
        envelopeDefinition.status = 'sent'; // Save as draft
    
        const envelopesApi = new docusign.EnvelopesApi(dsApiClient);
        const results = await envelopesApi.createEnvelope(accountInfo.apiAccountId, { envelopeDefinition: envelopeDefinition });
        const envelopeId = results.envelopeId;
    
        console.log(`Draft envelope created. EnvelopeId: ${envelopeId}`);
        return { envelopeId, accountInfo };    
    } catch (error) {
        console.log(error)
    }
  }
  
  
  async function generateEmbeddedSigningURL(envelopeId, accountInfo) {
    try {
        const dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(accountInfo.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + accountInfo.accessToken);
    
        const viewRequest = new docusign.RecipientViewRequest();
        viewRequest.returnUrl = 'https://uobo.ca'; // Change to your return URL
        viewRequest.authenticationMethod = 'none';
        viewRequest.email = 'uobo.drive@gmail.com'; // Dealer's email
        viewRequest.userName = 'Uobo'; // Dealer's name
        viewRequest.clientUserId = '1000'; // Unique ID for the dealer
    
        const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

        console.log('=============================', accountInfo.apiAccountId, envelopeId, { recipientViewRequest: viewRequest })
        const results = await envelopesApi.createRecipientView(accountInfo.apiAccountId, envelopeId, { recipientViewRequest: viewRequest });
        const url = results.url;
    
        console.log(`Embedded signing URL: ${url}`);
        return url;    
    } catch (error) {
        // console.log(error)
        console.log(error.message);
    }
  }

async function main(signerEmail, signerName, ccEmail, ccName) {
  const { envelopeId, accountInfo } = await createDraftEnvelope();
  const embeddedSigningURL = await generateEmbeddedSigningURL(envelopeId, accountInfo, signerEmail, signerName);

  console.log(`Redirect the dealer to the following URL to add placeholders: ${embeddedSigningURL}`);
}

// main().catch(console.error);

module.exports = { main }
