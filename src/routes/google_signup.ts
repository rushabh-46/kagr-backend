import { OAuth2Client } from 'google-auth-library';
import { google_auth } from '../config/config.json';

const client = new OAuth2Client(google_auth.client_id);

async function verify(token: string) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: google_auth.client_id
  });

  const payload = ticket.getPayload();
  console.log('verified via social login via token --->  ', payload);

  if (!payload) {
    console.error('Social login via token failed', token);
    throw new Error('SOCIAL_LOGIN_FAILED');
  }

  return {
    google_id: payload!['sub'],
    email: payload!['email'],
    name: payload!['name']
  };
}

exports = {
  verify
};
