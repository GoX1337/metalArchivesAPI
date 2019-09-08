const MongoClient = require('mongodb').MongoClient

const state = {
  db: null
}

exports.connect = (url, database, done) => {
  if (state.db) return done();

  MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
      if (err) return done(err);
      state.db = client.db(database);
      done();
  }); 
}

exports.get = () => {
  return state.db;
}

exports.close = (done) => {
  if (state.db) {
    state.db.close((err, result) => {
      state.db = null;
      state.mode = null;
      done(err);
    });
  }
}