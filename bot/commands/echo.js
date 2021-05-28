function echo(interaction) {
  let input = interaction.data.options.find(option => option.name === "input")?.value
  return { type: 4, data: { content: `You sent "${input}".` } };
}

module.exports = {
  name: "echo",
  description: "Responds with your input.",
  options: [
    {
      name: "input",
      type: 3,
      description: "The input which should be echoed back.",
      required: true,
    }
  ],
  run: echo
}
