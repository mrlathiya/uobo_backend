const docusign = require('docusign-esign');
const signingViaEmail = require('../config/lib/eSignature/examples/signingViaEmail');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')();

const jwtConfig = require('./jwtConfig.json');
const { ProvisioningInformation } = require('docusign-esign');
const demoDocsPath = path.resolve(__dirname, '../config/demo_documents');
const doc2File = 'Order_Flows.docx';
const doc3File = 'World_Wide_Corp_lorem.pdf';

const SCOPES = [
  'signature', 'impersonation'
];

function getConsent() {
  var urlScopes = SCOPES.join('+');

  // Construct consent URL
  var redirectUri = 'https://developers.docusign.com/platform/auth/consent';
  var consentUrl = `${jwtConfig.dsOauthServer}/oauth/auth?response_type=code&` +
                      `scope=${urlScopes}&client_id=${jwtConfig.dsJWTClientId}&` +
                      `redirect_uri=${redirectUri}`;

  console.log('Open the following URL in your browser to grant consent to the application:');
  console.log(consentUrl);
  console.log('Consent granted? \n 1)Yes \n 2)No');
  let consentGranted = prompt('');
  if (consentGranted === '1'){
    return true;
  } else {
    console.error('Please grant consent!');
    process.exit();
  }
}

async function authenticate(){
  const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
  const dsApi = new docusign.ApiClient();
  dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
  let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);

  try {
    const results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
      jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
      jwtLifeSec);
    const accessToken = results.body.access_token;

    // get user info
    const userInfoResults = await dsApi.getUserInfo(accessToken);

    // use the default account
    let userInfo = userInfoResults.accounts.find(account =>
      account.isDefault === 'true');

    return {
      accessToken: results.body.access_token,
      apiAccountId: userInfo.accountId,
      basePath: `${userInfo.baseUri}/restapi`
    };
  } catch (e) {
    console.log(e);
    let body = e.response && e.response.body;
    // Determine the source of the error
    if (body) {
        // The user needs to grant consent
      if (body.error && body.error === 'consent_required') {
        if (getConsent()){ return authenticate(); };
      } else {
        // Consent has been granted. Show status code for DocuSign API error
        this._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
        ${JSON.stringify(body, null, 4)}\n\n`);
      }
    }
  }
}

function getEnvelopeDefinition(args) {
  let env = new docusign.EnvelopeDefinition();
  env.emailSubject = 'Please sign this document';

  let doc2DocxBytes = fs.readFileSync(args.envelopeArgs.doc2File);
  let doc2DocxBase64 = Buffer.from(doc2DocxBytes).toString('base64');

  let doc3PdfBytes = fs.readFileSync(args.envelopeArgs.doc3File);
  let doc3PdfBase64 = Buffer.from(doc3PdfBytes).toString('base64');

  let doc2 = docusign.Document.constructFromObject({
    documentBase64: doc2DocxBase64,
    name: 'Order_Flows', 
    fileExtension: 'docx',
    documentId: '2'
  });

  let doc3 = docusign.Document.constructFromObject({
    documentBase64: doc3PdfBase64,
    name: 'World_Wide_Corp_lorem',
    fileExtension: 'pdf',
    documentId: '3'
  });

  env.documents = [doc2, doc3];

  let signer1 = docusign.Signer.constructFromObject({
    email: args.envelopeArgs.signerEmail,
    name: args.envelopeArgs.signerName,
    recipientId: '1',
    routingOrder: '1'
  });

  let cc1 = docusign.CarbonCopy.constructFromObject({
    email: args.envelopeArgs.ccEmail,
    name: args.envelopeArgs.ccName,
    recipientId: '2',
    routingOrder: '2'
  });

  let signHere1 = docusign.SignHere.constructFromObject({
    anchorString: "Please Sign Here",
    anchorXOffset: "1",
    anchorYOffset: "0",
    anchorUnits: "inches"
  });

  let signer1Tabs = docusign.Tabs.constructFromObject({
    signHereTabs: [signHere1]
  });

  signer1.tabs = signer1Tabs;

  env.recipients = docusign.Recipients.constructFromObject({
    signers: [signer1],
    carbonCopies: [cc1]
  });

  env.status = args.envelopeArgs.status;

  return env;
}

function getArgs(apiAccountId, accessToken, basePath, signerEmail, signerName, ccEmail, ccName){
  const envelopeArgs = {
    signerEmail: signerEmail,
    signerName: signerName,
    ccEmail: ccEmail,
    ccName: ccName,
    status: 'sent',
    doc2File: path.resolve(demoDocsPath, doc2File),
    doc3File: path.resolve(demoDocsPath, doc3File)
  };
  const args = {
    accessToken: accessToken,
    basePath: basePath,
    accountId: apiAccountId,
    envelopeArgs: envelopeArgs
  };

  return args;
}

async function main(signerEmail, signerName, ccEmail, ccName){
  let accountInfo = await authenticate();
  let args = getArgs(accountInfo.apiAccountId, accountInfo.accessToken, accountInfo.basePath, signerEmail, signerName, ccEmail, ccName);

  let dsApiClient = new docusign.ApiClient();
  dsApiClient.setBasePath(args.basePath);
  dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

  let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

  let envelope = getEnvelopeDefinition(args);
  let results = await envelopesApi.createEnvelope(args.accountId, { envelopeDefinition: envelope });
  let envelopeId = results.envelopeId;

  console.log(`Envelope was created. EnvelopeId: ${envelopeId}`);
  return envelopeId;
}

module.exports = { main };
