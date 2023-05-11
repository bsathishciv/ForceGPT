const JSONdb = require('simple-json-db');
const db = new JSONdb('./request-store.json');

module.exports = {
    db
}