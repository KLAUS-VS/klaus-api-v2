'use strict';

const fs = require('fs');
const baseJoi = require('joi');
const extension = require('joi-date-extensions');
const joi = baseJoi.extend(extension);
const boom = require('boom');
const uniqueString = require('unique-string');
const readable = require('stream').Readable;
const ObjectId = require('mongoose').Types.ObjectId;
const Test = require('../models/test-model');

const register = async server => {
  server.route({
    method: 'GET',
    path: '/tests/',
    handler: () => {
      return Test.aggregate([{ $limit: 20 }]);
    },
  });
  server.route({
    method: 'GET',
    path: '/tests/{_id}',
    options: {
      validate: {
        params: {
          _id: joi.string().regex(/^[a-f\d]{24}$/i),
        },
      },
    },
    handler: async (request, h) => {
      const fileDetails = await Test.aggregate([{
        $match: { _id: ObjectId(request.params._id) },
      }]);
      if (fileDetails.length <= 0) return boom.badRequest('No such file');
      const fileStream = fs.createReadStream(fileDetails[0].path);
      return h.response(fileStream)
        .type('application/pdf')
        .header('Content-Type', 'application/pdf')
        .header('Content-Length', fileStream.length)
        .header('Content-Disposition',
          `attachment; filename=${fileDetails[0].meta.name}`);
    },
  });
  server.route({
    method: 'POST',
    path: '/tests/',
    options: {
      payload: {
        output: 'stream',
        allow: 'multipart/form-data',
      },
      validate: {
        payload: {
          'test-file': joi.object().type(readable),
          date: joi.date().format('YYYY-MM-DD'),
          edv: joi.number().min(100000).max(999999),
          subject: joi.string().regex(/^[a-z\d\s\-_äöüß:;.]+$/i),
          teacher: joi.string().regex(/^[a-z\d\s\-_äöüß:;.]+$/i),
          course: joi.string().regex(/^[a-z\d\s\-_äöüß:;.]+$/i),
        },
      },
    },
    handler: async request => {
      const file = request.payload['test-file'];
      if (!file) return boom.badRequest('No file uploaded');
      if (!(file.hapi.headers['content-type'] === 'application/pdf')) {
        return boom.badRequest('File is not of type pdf');
      }
      const path = `tests/${uniqueString()}.pdf`;
      const fileStream = fs.createWriteStream(path);
      const details = await saveFile(file, fileStream, path)
        .catch(err => boom.badImplementation(err));
      const newTest = new Test({
        path: details.path,
        meta: {
          name: details.originalName,
          date: request.payload['date'],
          edv: request.payload['edv'],
          subject: request.payload['subject'],
          teacher: request.payload['teacher'],
          course: request.payload['course'],
        },
      });
      await newTest.save();
      return { message: 'success' };
    },
  });
};

const saveFile = (file, fileStream, path) => {
  return new Promise((resolve, reject) => {
    file.on('error', err => reject(err));
    file.pipe(fileStream);
    file.on('end', err => {
      if (err) reject(err);
      const fileDetails = {
        originalName: file.hapi.filename,
        path,
      };
      resolve(fileDetails);
    });
  });
};

module.exports = {
  register,
  name: 'route-tests',
};
