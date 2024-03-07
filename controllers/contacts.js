// Contacts not used (requires Google Peoples API approval)

const {google} = require('googleapis');
const Contact = require('../models/contact');

// Fetch contacts
async function fetchContacts(accessToken) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({access_token: accessToken});

  const peopleService = google.people({version: 'v1', auth: oauth2Client});
  const res = await peopleService.people.connections.list({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses,phoneNumbers',
  });
  // array of contacts
  return res.data.connections; 
}

// Save contacts to the database
async function saveContacts(contacts) {
    for (const contact of contacts) {
        const {resourceName, names, emailAddresses, phoneNumbers} = contact;

        let newContact = {
            googleContactId: resourceName,
            names: names ? names.map(name => ({
                givenName: name.givenName,
                familyName: name.familyName
            })) : [],
            emailAddresses: emailAddresses ? emailAddresses.map(email => ({
                value: email.value,
                type: email.type
            })) : [],
            phoneNumbers: phoneNumbers ? phoneNumbers.map(phone => ({
                value: phone.value,
                type: phone.type
            })) : []
        };

        // Save or update the contact in the database
        await Contact.findOneAndUpdate({ googleContactId: resourceName }, newContact, { upsert: true });
    }
}

exports.displayUserContacts = async (req, res) => {
  try {
    const accessToken = req.user.accessToken; 
    const contacts = await fetchContacts(accessToken);

    // Save contacts to the database
    await saveContacts(contacts);

    res.render('contacts/index', {contacts});
  } catch (error) {
    console.error('Error fetching or saving contacts:', error);
    res.status(500).send('Error fetching contacts');
  }
};
