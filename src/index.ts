import express from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/../.env' });

import user from './routes/user';
import auth from './routes/auth';
import { handleUnauthorizedError } from './middlewares';
import { expressjwt } from 'express-jwt';

const app = express();
const port = process.env.PORT ?? 8080;

// Middlewares
app.use(express.json());

app.use(
  '/user',
  expressjwt({
    secret: process.env.JWT_ACCESS_SECRET!,
    algorithms: ['HS256']
  })
);

app.use((req, res, next) => {
  console.info(`index.ts requested ${req.path} ====> body: ${JSON.stringify(req.body)}, headers: ${JSON.stringify(req.headers)}, cookie: ${JSON.stringify(req.headers.cookie)}}`);
  next();
});

// Routes
app.use('/user', user);
app.use('/', auth);

// Error handling
app.use(handleUnauthorizedError);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
