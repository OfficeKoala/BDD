const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const db = new lowdb(new FileSync('db.json'))

const uploads= () => db.get('uploads').value();


// module.exports={};