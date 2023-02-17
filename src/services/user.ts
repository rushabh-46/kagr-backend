import type { User } from '@prisma/client';
import { prisma } from '../../prisma/client';

const update = async (user_id: string, updates: Partial<User>) => {
  try {
    if (updates.email) {
      throw new Error('CANNOT_UPDATE_EMAIL_ID');
    }
    if (updates.password) {
      throw new Error('CANNOT_UPDATE_PASSWORD');
    }
    const user = await prisma.user.update({
      where: { id: user_id },
      data: updates,
      select: {
        email: true
      }
    });
    return user;
  } catch (err) {
    console.error('error in user.update', err);
    throw err;
  }
};

export { update };
