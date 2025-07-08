import express from 'express';
import { changeMailSendTiming } from '../controllers/email.service.js';
const router = express.Router();

router.post('/timechange',changeMailSendTiming);
export default router;