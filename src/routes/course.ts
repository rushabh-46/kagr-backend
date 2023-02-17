import { Router } from 'express';
import type { AuthRequestWithPayload, RequestWithPayload } from '../types';

const router = Router();

const COURSE_PUBLIC_FIELDS = {
  id: true,
  title: true,
  description: true
};

router.post('/get', async (req: RequestWithPayload<{ id: string }>, res) => {
  const course = await prisma?.course.findUnique({
    where: {
      id: req.body.id
    },
    select: COURSE_PUBLIC_FIELDS
  });

  return res.json(course);
});

export default router;
