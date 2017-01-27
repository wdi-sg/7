const express = require('express')
const router = express.Router()
const User = require('../models/user_model')
const passport = require('../config/ppConfig')
const flash = require('connect-flash')
const Post = require('../models/post_model')

router.get('/signup', function (req, res) {
  res.render('auth/signup')
})

router.post('/signup', function (req, res) {
  User.findOne({ email: req.body.email }, function (err, results) {
    if (err) req.flash('error', 'sign-up email addresses must be unique')
    if (results === null) {
      req.flash('email not found, proceeding to register user')
      User.create(req.body, function (err, createdUser) {
        if (err) req.flash('error', 'Sign-up email addresses must be unique. Please try again.')
        else {
          req.flash('success', 'Account has been created. Please log in')
          res.redirect('/auth/login')
        }
      })
    } else {
      req.flash('existing email found')
      res.redirect('/auth/login')
    }
  })
})

router.get('/login', function (req, res) {
  res.render('auth/login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/user',
  failureRedirect: '/auth/login',
  failureFlash: 'Invalid username and/or password',
  successFlash: 'You have logged in'
}))

router.get('/logout', function (req, res) {
  req.logout()
  req.flash('success', 'logged out')
  console.log('logout works')
  res.redirect('/')
})

module.exports = router
