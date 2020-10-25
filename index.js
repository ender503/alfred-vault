const alfy = require('alfy');

const { fetch } = require('./vault');

const items = await fetch(alfy.input);
alfy.output(items);
