function self(interaction) {
  return { type: 4, data: { content: `Your username: ${interaction.member.user.username}\nYour ID: ${interaction.member.user.id}` } };
}

module.exports = {
  name: "self",
  description: "Shows where you about yourself.",
  run: self
};
