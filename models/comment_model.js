// link to the user through making user id reference here...

const mongoose = require('mongoose')

const replySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  text: {
    type: String,
    required: true
  }
}, { timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })

const Reply = mongoose.model('Reply', replySchema)

module.exports = Reply
