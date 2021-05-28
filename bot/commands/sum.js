function sum(interaction) {
  let a = interaction.data.options.find(option => option.name === "a")?.value;
  let b = interaction.data.options.find(option => option.name === "b")?.value;
  return { type: 4, data: { content: `The sum is ${a + b}!` } };
}

module.exports = {
  name: "sum",
  description: "Replies with the sum of two numbers.",
  options: [
    {
      name: "a",
      type: 4,
      description: "The first number",
      required: true,
    },
    {
      name: "b",
      type: 4,
      description: "The second number",
      required: true,
    }
  ],
  run: sum
}
