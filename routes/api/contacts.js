const express = require('express');
const contactsRouter = express.Router();
const Joi = require('joi');
const auth = require('../../config/authorization.js');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
} = require('../../models/contacts');

const schema = Joi.object({
  name: Joi.string().alphanum().min(2).max(40).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(3).max(25).required(),
  favorite: Joi.boolean(),
});

contactsRouter.get('/', auth, async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { favorite } = req.query;
    let contacts = await listContacts(userId);

    if (favorite === 'true') {
      contacts = contacts.filter(contact => contact.favorite);
    }

    res.json({
      status: 'success',
      code: 200,
      data: {
        contacts,
      },
    });
  } catch (error) {
    next(error);
  }
});

contactsRouter.get('/:contactId', auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { id: userId } = req.user;
    const contact = await getContactById(contactId, userId);

    if (contact) {
      res.json({
        status: 'success',
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
    }
  } catch (error) {
    next(error);
  }
});

contactsRouter.post('/', auth, async (req, res, next) => {
  try {
    const { body } = req;
    const { id: userId } = req.user;
    const { error } = schema.validate(body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Problem with validation',
        errorDetails: error.details,
      });
    }

    const addedContact = await addContact(body, userId);

    res.status(201).json({
      status: 'success',
      code: 201,
      data: {
        contact: addedContact,
      },
    });
  } catch (error) {
    next(error);
  }
});

contactsRouter.delete('/:contactId', auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { id: userId } = req.user;
    const contact = await getContactById(contactId, userId);

    if (contact) {
      await removeContact(contactId, userId);
      res.json({
        status: 'success',
        code: 200,
        message: 'Contact deleted',
        deletedContact: contact,
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
    }
  } catch (error) {
    next(error);
  }
});

contactsRouter.put('/:contactId', auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { id: userId } = req.user;
    const { body } = req;
    const { error } = schema.validate(body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Problem with validation',
        errorDetails: error.details,
      });
    }

    const contact = await getContactById(contactId, userId);

    if (contact) {
      const updatedContact = await updateContact(contactId, body, userId);
      res.json({
        status: 'success',
        code: 200,
        updatedData: {
          contact: updatedContact,
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
    }
  } catch (error) {
    next(error);
  }
});

contactsRouter.patch('/:contactId/favorite', auth, async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { id: userId } = req.user;
    const { favorite } = req.body;

    if (favorite === undefined) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'missing field favorite',
      });
    }

    const updatedContact = await updateFavorite(contactId, favorite, userId);

    if (updatedContact) {
      res.json({
        status: 'success',
        code: 200,
        updatedData: {
          contact: updatedContact,
        },
      });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = contactsRouter;
