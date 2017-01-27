const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/

var UserSchema = new mongoose.Schema({
  name: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, 'First name must be at least 3 characters']
    },
    lastname: {
      type: String,
      required: true
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: emailRegex
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters']
  },
  website: {
    type: String,
    lowercase: true
  },
  skillsintro: {
    type: String
  },
  role: {
    type: String,
    required: true,
    minlength: [5, 'One word to describe your profession']
  },
  posts: [{type: mongoose.Schema.Types.ObjectId, ref: 'Post'}],
  comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Reply'}]
})

UserSchema.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) return next()
  var hash = bcrypt.hashSync(user.password, 10)
  user.password = hash
  next()
})

UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    delete ret.password
    return ret
  }
}

module.exports = mongoose.model('User', UserSchema)
