const Notification = require('../models/Notification');
// Best-effort: a failed notification must never break the main operation.
exports.notify = async (recipients, { title, message, category, link }) => {
  try {
    const ids = [...new Set(recipients.map(String))];
    if (ids.length) await Notification.insertMany(ids.map((recipient) => ({ recipient, title, message, category, link })));
  } catch (e) { console.error('notify failed:', e.message); }
};
