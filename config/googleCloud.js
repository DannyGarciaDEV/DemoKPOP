const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const mexicoCityId = 'a8d7830223ad236476ff40f48f729f6487dff251ed6190515d47b4d08608f209@group.calendar.google.com';

// Token and credentials file paths
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Load previously authorized credentials from file.
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Save OAuth2 client credentials to file.
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Authorize and return OAuth2 client.
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }

  const oauthPort = process.env.OAUTH_PORT || 3001; // avoid port conflict here!

  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
    port: oauthPort, 
  });

  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * List upcoming calendar events.
 */
async function listEvents() {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  console.log('Upcoming 10 events:');
  events.forEach((event) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
}

/**
 * Create an event in the Mexico City calendar.
 * @param {object} event - Event object following Google Calendar API format
 * @returns {object} Created event result
 */
async function createEvent(event) {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  const gCalendarEvent = await calendar.events.insert({
    auth: auth,
    calendarId: mexicoCityId,
    resource: event,
  });

  console.log('Event created: %s', gCalendarEvent.data.htmlLink);
  return gCalendarEvent.data;
}

module.exports = { createEvent, listEvents };
