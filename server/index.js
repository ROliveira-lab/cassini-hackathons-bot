const express = require("express");
const morgan = require('morgan');
const path = require('path');

module.exports = () => {

  const app = express();

  app.use(morgan('common'));

  app.use("/public", express.static(path.join(__dirname, "public")));

  app.use(express.json());

  app.use("/webhooks/mailerlite/", require("./mailerlitewebhook")());

  app.get("/", (req, res) => {
    res.json({ status: "OK" });
  });

  app.listen(process.env.PORT, () => {
    console.log("CASSINI Hackathons Web server is running!");
  });

  return app;

}
