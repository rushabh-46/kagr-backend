import { Router } from 'express';
import { prisma } from '../../prisma/client';
import bcrypt from 'bcrypt';
import type { AuthRequestWithPayload, RequestWithPayload } from '../types';
import type { User } from '@prisma/client';
import type { Request as ExpressJwtRequest } from 'express-jwt';

import { update as user_update } from '../services/user';

const USER_PUBLIC_FIELDS: Partial<Record<keyof User, boolean>> = {
  id: true,
  email: true
};

const router = Router();

router.get('/', async (req: ExpressJwtRequest, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.auth?.uid
    },
    select: USER_PUBLIC_FIELDS
  });

  return res.json(user);
});

router.post('/create', async (req: AuthRequestWithPayload<User>, res) => {
  const { password, email } = req.body;

  const user = await prisma.user.update({
    where: {
      id: req.auth?.uid
    },
    data: {
      email,
      password: password ? bcrypt.hashSync(password, 10) : undefined
    },
    select: USER_PUBLIC_FIELDS
  });

  return res.status(200).json(user);
});

router.post('/update', async (req: RequestWithPayload<User & { updates: User }>, res) => {
  try {
    console.log(req.body);
    if (!req.body.id) {
      throw new Error('MISSING_USER_ID');
    }
    if (!req.body.updates) {
      throw new Error('MISSING_UPDATES_DATE');
    }
    const resp = await user_update(req.body.id, req.body.updates);
    return res.status(200).json(resp);
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/get_registered_courses', async (req: AuthRequestWithPayload<boolean>, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: req.auth?.uid
      },
      select: {
        courseIds: true,
        courses: true
      }
    });
    console.log('user ===>', user);
    return user?.courses ?? [];
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

router.post('');

export default router;
