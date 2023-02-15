import { Router, Request } from 'express';
import { prisma } from '../../prisma/client';
import bcrypt from 'bcrypt';
import type { AuthRequestWithPayload, RequestWithPayload } from '../types';
import { getAccessToken, getRefreshToken, getUidFromToken, validateRefreshToken } from '../utils';
import { authRequired } from '../middlewares';
import type { User } from '@prisma/client';

const router = Router();

type AuthPayload = {
  email: string;
  password: string;
};

/**
 * Login with email, password in the request body
 */
router.post('/login', async (req: RequestWithPayload<AuthPayload>, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(400).json({
      message: 'Missing required fields'
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user || !bcrypt.compareSync(password, user.password!)) {
    return res.status(400).json({
      message: 'Invalid credentials'
    });
  }

  return res.status(200).json({
    accessToken: getAccessToken(user.id),
    refreshToken: getRefreshToken(user.id)
  });
});

/**
 * Sign Up either by email/password or complete anonymous user setup after extracting uid from cookie/auth
 */
router.post('/signup', authRequired({ failIfNoTokenFound: false }), async (req: AuthRequestWithPayload<AuthPayload>, res) => {
  const { password, email } = req.body;
  const isAnonymous = !!req.auth?.uid;

  if (!password || !email) {
    return res.status(400).json({
      message: 'Missing required fields'
    });
  }

  const alreadyExists = await prisma.user.count({
    where: {
      email
    }
  });

  if (alreadyExists) {
    return res.status(400).json({
      message: 'User already exists'
    });
  }

  const encrypted_password: string = bcrypt.hashSync(password, 10);

  let user: Pick<User, 'id'>;
  if (isAnonymous) {
    // Upgrading anonymous user to permanent user
    user = await prisma.user.update({
      where: {
        id: req.auth?.uid
      },
      data: {
        email,
        password: encrypted_password
      },
      select: {
        id: true
      }
    });
  } else {
    user = await prisma.user.create({
      data: {
        email,
        password: encrypted_password
      },
      select: {
        id: true
      }
    });
  }
  return res.status(201).json({
    accessToken: getAccessToken(user.id),
    refreshToken: getRefreshToken(user.id)
  });
});

router.post('/refresh', async (req: RequestWithPayload<{ refreshToken: string }>, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      message: 'Missing required fields'
    });
  }

  if (!validateRefreshToken(refreshToken)) {
    return res.status(403).json({
      message: 'Invalid refresh token'
    });
  }

  const uid = getUidFromToken(refreshToken);

  return res.status(200).json({
    accessToken: getAccessToken(uid)
  });
});

export default router;
