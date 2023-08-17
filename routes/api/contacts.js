const express = require('express');
const router = express.Router();
const Joi = require('joi');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
} = require('../../models/contacts');

const schema = Joi.object({
  name: Joi.string().alphanum().min(2).max(40).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(3).max(25).required(),
});

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();
    // res.status(200).json(contacts);
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

router.get('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await getContactById(contactId);

    if (contact) {
      // res.status(200).json(contact);
      res.json({
        status: 'success',
        code: 200,
        data: {
          contact,
        },
      });
    } else {
      // res.status(404).json({ message: 'Not found' });
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

router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    // ---- validation START
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Problem with validation',
        errorDetails: error.details,
      });
    }
    // ---- validation END

    // ---- old ver. START
    // if (!name || !email || !phone) {
    //   res.status(400).json({
    //     status: 'error',
    //     code: 400,
    //     message: 'Missing required fields',
    //   });
    //   return;
    // }
    // ---- old ver. END

    const newContact = { name, email, phone };

    const addedContact = await addContact(newContact);
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

router.delete('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const contact = await getContactById(contactId);

    if (contact) {
      await removeContact(contactId);
      res.json({
        status: 'success',
        code: 200,
        message: 'Contact deleted',
        deletedContact: contact,
      });
      // res.status(200).json({ message: 'contact deleted' });
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
      // res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

router.put('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { name, email, phone } = req.body;

    // ---- validation START
    const { error } = schema.validate({ name, email, phone });

    if (error) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'Problem with validation',
        errorDetails: error.details,
      });
    }
    // ---- validation END

    // ---- old ver. START
    // if (!name || !email || !phone) {
    //   res.status(400).json({
    //     status: 'error',
    //     code: 400,
    //     message: 'Missing required fields',
    //   });
    //   return;
    //   // res.status(400).json({ message: 'missing required name fields' });
    // }
    // ---- old ver. END

    const contact = await getContactById(contactId);

    if (contact) {
      const updatedContact = await updateContact(contactId, req.body);
      res.json({
        status: 'success',
        code: 200,
        updatedData: {
          contact: updatedContact,
        },
      });
      // res.status(200).json(updatedContact);
    } else {
      res.status(404).json({
        status: 'error',
        code: 404,
        message: 'Contact not found',
      });
      // res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
