import { OAuth2Client } from 'google-auth-library';
import { google_auth } from '../config/config.json';
const client = new OAuth2Client(process.env.CLIENT_ID);

async function verify(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();

  if (payload) {
    const userid = payload['sub'];
  }
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
}

const verify_token = async (token: string) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: google_auth.client_id
  });
  const payload = ticket.getPayload();
  console.log('verified via social login via token --->  ', payload);
  return {
    google_id: payload!['sub'],
    email: payload!['email'],
    name: payload!['name']
  };
};
