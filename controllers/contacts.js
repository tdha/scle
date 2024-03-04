const {google} = require('googleapis');

// fetch contacts
async function fetchContacts(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({access_token: accessToken});

  const peopleService = google.people({version: 'v1', auth: oauth2Client});
  const res = await peopleService.people.connections.list({
    resourceName: 'people/me',
    personFields: 'names, emailAddresses, phoneNumbers',
  });
  // array of contacts
  return res.data.connections; 
}

exports.displayUserContacts = async (req, res) => {
  try {
    const accessToken = req.user.accessToken; // access token stored in user session
    const contacts = await fetchContacts(accessToken);
    res.render('contacts/index', {contacts});
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).send('Error fetching contacts');
  }
};
