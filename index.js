const dotenv = require("dotenv");

dotenv.config();

const prefix = "!";

const countries = [
  "Cyprus",
  "Czech Republic",
  "Estonia",
  "France",
  "Greece",
  "Ireland",
  "Netherlands",
  "Portugal",
  "Slovenia",
  "Switzerland"
]

require("./discord-bot")(process.env.TOKEN, prefix, countries);

require("./server-express")(process.env.PORT || 3000);
// require("./server-fastify")(process.env.PORT || 3000);
