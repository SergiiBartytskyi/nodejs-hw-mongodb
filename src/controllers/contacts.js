import createHttpError from 'http-errors';
import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { env } from '../utils/env.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const userId = req.user._id;
  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactById({ contactId, userId });

  if (!contact) {
    next(createHttpError(404, 'Contact not found!'));
    return;
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  const { name, phoneNumber, email, isFavourite, contactType } = req.body;
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl = null;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo, 'contacts');
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  if (!name || !phoneNumber || !contactType) {
    return next(
      createHttpError(400, 'Required fields: name, phoneNumber, contactType!'),
    );
  }

  const newContact = await createContact({
    name,
    phoneNumber,
    email,
    isFavourite,
    contactType,
    userId,
    photo: photoUrl,
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const upsertContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const { name, phoneNumber, contactType } = req.body;
  const photo = req.file;

  let photoUrl = null;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateContact(
    { contactId, userId },
    {
      ...req.body,
      photo: photoUrl,
    },
    {
      upsert: true,
    },
  );

  if (!result) {
    return next(createHttpError(404, 'Contact not found!'));
  }

  if (result.isNew) {
    if (!name || !phoneNumber || !contactType) {
      return next(
        createHttpError(
          400,
          'Name, Phone Number, Contact Type are required when creating a contact!',
        ),
      );
    }
  }

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: result.isNew
      ? 'Successfully created a contact!'
      : 'Successfully updated the contact!',
    data: result.contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const photo = req.file;
  let photoUrl = null;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const result = await updateContact(
    { contactId, userId },
    {
      ...req.body,
      photo: photoUrl,
    },
  );

  if (!result) {
    return next(createHttpError(404, 'Contact not found!'));
  }

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: result.contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await deleteContact({ contactId, userId });

  if (!contact) {
    next(createHttpError(404, 'Contact not found!'));
    return;
  }

  res.status(204).send();
};
