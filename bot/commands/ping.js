async function ping(interaction) {
  return { content: `Pong!` };
}

module.exports = {
  name: "ping",
  description: "Replies with pong.",
  run: ping
};
