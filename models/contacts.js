const Contact = require('../service/schemas/schemaContacts');

const listContacts = async userId => {
  try {
    return Contact.find({ owner: userId });
  } catch (error) {
    console.error('Error occurred when trying to show contacts:', error);
    throw error;
  }
};

const getContactById = async (contactId, userId) => {
  try {
    const contact = await Contact.findById({ _id: contactId, owner: userId });
    return contact;
  } catch (error) {
    console.error('Error occurred when trying to get contact:', error);
    throw error;
  }
};

const removeContact = async (contactId, userId) => {
  try {
    const result = await Contact.findByIdAndRemove({ _id: contactId, owner: userId });
    return result;
  } catch (error) {
    console.error('Error occurred when removing contact:', error);
    throw error;
  }
};

const addContact = async (body, userId) => {
  try {
    const newContact = await Contact.create({ ...body, owner: userId });
    return newContact;
  } catch (error) {
    console.error('Error occurred when adding contact:', error);
    throw error;
  }
};

const updateContact = async (contactId, body, userId) => {
  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      { _id: contactId, owner: userId },
      body,
      { new: true }
    );
    return updatedContact;
  } catch (error) {
    console.error('Error occurred when updating contact:', error);
    throw error;
  }
};

const updateFavorite = async (contactId, favorite, userId) => {
  try {
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, owner: userId },
      { favorite },
      { new: true }
    );

    return updatedContact;
  } catch (error) {
    console.error('Error occurred when updating contact:', error);
    throw error;
  }
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateFavorite,
};
