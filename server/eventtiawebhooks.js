const { Router } = require("express");

const eventtia = require("../services/eventtia");

module.exports = () => {

  const router = Router();
  
  router.post("/attendee_created", async (req, res) => {
    console.log(req.body);
    res.status(200).json({ status: "OK" });
  });

  router.post("/attendee_updated", async (req, res) => {
    console.log(req.body);
    res.status(200).json({ status: "OK" });
  });

  return router;

}