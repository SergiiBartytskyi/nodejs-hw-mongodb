import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import greetingRouter from './greeting.js';

const router = Router();

router.use('/', greetingRouter);
router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);

export default router;
