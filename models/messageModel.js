const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = new Schema(
	{
		conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
		sender: { type: Schema.Types.ObjectId, ref: "User" },
		text: String,
		seen: {
			type: Boolean,
			default: false,
		},
		img: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
