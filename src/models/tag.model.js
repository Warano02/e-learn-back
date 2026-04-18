const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    category: {
      type: String,
      enum: [
        "programming",
        "design",
        "data",
        "business",
        "security",
        "devops",
        "other",
      ],
      required: true,
    },

    aliases: [
      {
        type: String,
      },
    ],

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tag", tagSchema);