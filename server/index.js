const express = require("express");
const morgan = require('morgan');

module.exports = (port) => {

  const app = express();

  app.use(morgan('common'));

  app.get("/", (req, res) => {
    res.json({ status: "OK" });
  });

  app.listen(port, () => {
    console.log(`Web server running at http://localhost:${port}`);
  });

}
