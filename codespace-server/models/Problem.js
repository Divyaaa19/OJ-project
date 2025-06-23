const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: String,
  output: String,
});

const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  constraints: String,
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  createdBy: String,
  testCases: [testCaseSchema],
});

module.exports = mongoose.model("Problem", problemSchema);
