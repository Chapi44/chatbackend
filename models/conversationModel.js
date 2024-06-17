const mongoose = require("mongoose");

const { Schema } = mongoose;

const conversationSchema = new Schema(
	{
		participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
		lastMessage: {
			text: String,
			sender: { type: Schema.Types.ObjectId, ref: "User" },
			seen: {
				type: Boolean,
				default: false,
			},
		},
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

module.exports = Conversation;
