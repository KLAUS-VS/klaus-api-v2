'use strict';

const mongoose = require('mongoose');

const test = {
  path: { type: String, required: true, unique: true },
  meta: {
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    edv: { type: Number, min: 100000, max: 999999 },
    subject: { type: String, required: true },
    teacher: { type: String, required: true },
    course: { type: String, required: true },
  },
};

const schema = new mongoose.Schema(test);

module.exports = mongoose.model('Test', schema);
