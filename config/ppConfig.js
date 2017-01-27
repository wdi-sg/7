const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user_model')

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

// run each time user goes to a new page. ensures that it's the same user so that relevant server data is accessed
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    // console.log(user);
    done(err, user)
  })
})

passport.use(new LocalStrategy ({
  usernameField: 'email',
  passwordField: 'password'
}, function (email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (err) return done(err)
    if (!user) return done(null, false)
    if (!user.validPassword(password)) return done(null, false)
    // console.log(user);
    return done(null, user)
  })
}))

module.exports = passport
