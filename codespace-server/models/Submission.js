const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  code: String,
  language: String,
  timestamp: Date,
});

module.exports = mongoose.model("Submission", submissionSchema);