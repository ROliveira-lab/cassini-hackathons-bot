const dotenv = require("dotenv");

dotenv.config();

require("./bot")(process.env.TOKEN);

require("./server")(process.env.PORT || 3000);
