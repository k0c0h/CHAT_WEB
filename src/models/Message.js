const { Schema, model } = require('mongoose');

const MessageSchema = new Schema(
  {
    user: { type: String, required: true },
    alertType: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: String },
  },
  { timestamps: true }
);

module.exports = model('Message', MessageSchema);
