'use strict';
const _ = require('lodash');
const mongoose = require('mongoose');
const slugify = require('slugify'); // yarn add slugify

const convertToObjectIdMongdb = (id) => new mongoose.Types.ObjectId(id);

const getIntoData = ({ fileds = [], object = {} }) => {
  return _.pick(object, fileds);
};

const getselectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetselectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((k) => {
    if (obj[k] === null) {
      delete obj[k];
    }
  });
  return obj;
};

/* 
    const a = {
        c : {
            d : 1
        }
    }
    => {
        `c.d`:1
    }
**/
const updateNestedObjectParser = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = obj[k];
    }
  });
  return final;
};


/**
 * Generate unique slug từ name
 * "Áo Thun Nike" → "ao-thun-nike-x7k2"
 */
const generateSlug = async (name, Model, slugField = 'usr_slug') => {
  // Chuyển tiếng Việt → không dấu + lowercase + gạch ngang
  let slug = slugify(name, {
    lower: true,
    strict: true,   // bỏ ký tự đặc biệt
    locale: 'vi',   // hỗ trợ tiếng Việt
  });

  // Kiểm tra trùng trong DB
  const existed = await Model.findOne({ [slugField]: slug }).lean();
  if (existed) {
    // Thêm random suffix nếu trùng
    const suffix = Math.random().toString(36).substring(2, 6); // vd: "x7k2"
    slug = `${slug}-${suffix}`;
  }

  return slug;
};

module.exports = {
  getIntoData,
  getselectData,
  unGetselectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  convertToObjectIdMongdb,
  generateSlug,
};
