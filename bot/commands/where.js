function where(interaction) {
  return { type: 4, data: { content: `You are in the <#${interaction.channel_id}> channel.` } };
}

module.exports = {
  name: "where",
  description: "Shows in which guild and channel you are",
  run: where
};
