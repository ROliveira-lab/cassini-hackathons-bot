const fastify = require("fastify");

module.exports = (port) => {

  const app = fastify({ logger: true });

  app.get("/", (req, reply) => {
    return { status: "OK" };
  });

  app.listen(port).then(() => {
    console.log(`Web server running at http://localhost:${port}`);
  });

}
