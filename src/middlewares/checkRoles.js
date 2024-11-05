import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/Contact.js';
import { ROLES } from '../constants/index.js';

export const checkRoles =
  (...roles) =>
  async (req, res, next) => {
    const { user } = req;
    if (!user) {
      next(createHttpError(401, 'Unauthorized: User not authenticated'));
      return;
    }

    const { role } = user;

    if (roles.includes(ROLES.ADMIN) && role === ROLES.ADMIN) {
      next();
      return;
    }

    if (roles.includes(ROLES.USER) && role === ROLES.USER) {
      const { contactId } = req.params;

      if (!contactId) {
        next();
        return;
      }

      const contact = await ContactsCollection.findOne({
        _id: contactId,
        userId: user._id,
      });

      if (contact) {
        next();
        return;
      } else {
        next(createHttpError(403, 'Forbidden: Access denied to this contact!'));
        return;
      }
    }

    next(createHttpError(403, 'Forbidden: User role not permitted!'));
  };
