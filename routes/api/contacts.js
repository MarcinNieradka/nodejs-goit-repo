const express = require('express');
const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
} = require('../../models/contacts');

router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();
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

router.post('/', async (req, res, next) => {
  try {
    const { body } = req;
    const addedContact = await addContact(body);

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

router.put('/:contactId', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    // const { name, email, phone } = req.body;

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

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const contactId = req.params.contactId;
    const { favorite } = req.body;

    if (favorite === undefined) {
      return res.status(400).json({
        status: 'error',
        code: 400,
        message: 'missing field favorite',
      });
    }

    const updatedContact = await updateFavorite(contactId, favorite);

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

module.exports = router;
