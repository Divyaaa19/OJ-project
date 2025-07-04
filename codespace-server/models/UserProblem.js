const mongoose = require("mongoose");

const userProblemSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: "Unsolved" },
});

module.exports = mongoose.model("UserProblem", userProblemSchema);
