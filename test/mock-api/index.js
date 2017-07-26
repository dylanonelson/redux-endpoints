const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();

const getJson = () => {
  const jsonFile = fs.readFileSync(
    path.resolve(__dirname, './json/resource.json')
  );

  const jsonString = jsonFile.toString();

  return JSON.parse(jsonString);
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})

app.get('/api/:id', (req, res) => {
  res.json(getJson());
});

app.listen(1111);
