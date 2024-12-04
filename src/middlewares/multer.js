import multer from 'multer';
import createHttpError from 'http-errors';
import { TEMP_UPLOAD_DIR } from '../constants/index.js';

const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, TEMP_UPLOAD_DIR);
  // }, or ->
  destination: TEMP_UPLOAD_DIR,
  filename: function (req, file, cb) {
    const uniquePrefix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniquePrefix}_${file.originalname}`;
    cb(null, filename);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5,
};

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split('.').pop();

  if (extension === 'exe') {
    return cb(createHttpError(400, '.exe extension not allow!'));
  }
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});
