const mongoose = require('mongoose')
const Reply = require('./comment_model')

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {
    type: String,
    required: true
  },
  article: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reply'}]
}, { timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
