const JSONdb = require('simple-json-db');
const db = new JSONdb(`${process.cwd()}/request-store.json`);

module.exports = {
    db
}