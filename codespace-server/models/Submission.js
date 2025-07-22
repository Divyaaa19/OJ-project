const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  code: String,
  language: String,
  timestamp: Date,
  verdict: { type: String, default: "Pending" },
});

const adminSubmissionSchema = new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  problemTitle: String,
  code: String,
  language: String,
  timestamp: Date,
  verdict: { type: String, default: "Pending" },
  results: [
    {
      input: String,
      expected: String,
      output: String,
      verdict: String,
    },
  ],
});

module.exports = mongoose.model("Submission", submissionSchema);
module.exports.AdminSubmission = mongoose.model("AdminSubmission", adminSubmissionSchema);