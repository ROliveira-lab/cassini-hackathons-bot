function ping(interaction) {
  return { type: 4, data: { content: `Pong!` } };
}

module.exports = {
  name: "ping",
  description: "Replies with pong.",
  run: ping
};
