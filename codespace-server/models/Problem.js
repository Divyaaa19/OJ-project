const mongoose = require("mongoose");

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, required: false },
  hidden: { type: Boolean, default: false } // optional
}); // optional: prevents auto-adding _id to each test case


const problemSchema = new mongoose.Schema({
  title: String,
  description: String,
  constraints: String,
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Easy" },
  createdBy: String,
  testCases: [testCaseSchema],
});

module.exports = mongoose.model("Problem", problemSchema);
