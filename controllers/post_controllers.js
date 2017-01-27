const Post = require('../models/post_model')
const User = require('../models/user_model')
const express = require('express')
const router = express.Router()
const flash = require('connect-flash')

// router.get('/', function (req, res) { // express gets triggered when someone types in '/' which is a request
//   res.redirect('/' + req.user._id) // server to respond with 'homepage'
// })

/* express gets triggered when URL is /:id.... posts by all users listed
his has to be further down as this address is more generic catch-all */

function userVerification (reqID, userID) {
  if (reqID == userID) return true
}

/* get post create page */
router.get('/:userid/create', function (req, res) {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, function (err) {
      if (err) {
        req.flash('error', 'something may have gone wrong')
        req.redirect('/')
      }
      res.render('post/createpost', {fields: null})
    })
  }
})

/* create todolist */
router.post('/:userid/create', function (req, res) {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    if (req.body.title === '' || req.body.article === '') {
      req.flash('error', 'Required fields must be filled')
      res.render('post/createpost', {
        fields: {
          title: req.body.title,
          article: req.body.article,
          tags: req.body.tags
        }
      })
    } else {
      Post.create({
        user: req.user._id,
        title: req.body.title,
        article: req.body.article,
        tags: req.body.tags
      }, function (err, newPost) {
        if (err) res.status(500).render({errMsg: err})
        User.findById(req.user._id, function (err, user) {
          if (err) res.status(500).render({errMsg: err})
          user.posts.push(newPost._id)
          user.save()
          req.flash('success', 'Post created')
          res.redirect('/user/' + req.user._id)
        })
      }
    )
    }
  }
})

router.get('/:userid/editprofile', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, function (err, profile) {
      if (err) res.status(500).render({errMsg: err})
      res.render('auth/editprofile', {userdetails: profile})
    })
  }
})

router.put('/:userid/editprofile', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User.findById(req.user._id, (err, updatedInfo) => {
      if (err) {
        req.flash('error', 'Profile update unsuccesful')
        res.redirect('/user/' + req.user.id + '/editprofile')
      } else {
        updatedInfo.name.firstname = req.body.firstname // in the form, the name of that field is meant for referencing
        updatedInfo.name.lastname = req.body.lastname
        updatedInfo.website = req.body.website
        updatedInfo.skillsintro = req.body.skillsintro
        updatedInfo.role = req.body.role
        updatedInfo.save(function (err) {
          (err) ? req.flash('error', 'Profile update unsuccessful') : req.flash('success', 'Profile updated')
          res.redirect('/user/' + req.user.id + '/editprofile')
        })
      }
    })
  }
})

router.get('/:userid/edit', function (req, res) {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    User
    .findById(req.user._id)
    .populate('posts')
    .exec(function (err, userArticles) {
      if (err) {
        req.flash('error', 'Something has gone wrong')
        res.redirect('/user/' + req.user.id)
      } else {
        res.render('post/postpage', {articles: userArticles})
      }
    })
  }
})

router.get('/:userid/edit/:postid', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    Post.find({user: req.user._id, _id: req.params.postid}, function (err, currentPost) {
      if (err) {
        req.flash('err', 'error occurred')
        res.redirect('/user/' + req.user.id)
      } else {
        res.render('post/editpost', {article: currentPost})
      }
    })
  }
})

/* update the post */
router.put('/:userid/edit/:postid', (req, res) => {
  Post.findOneAndUpdate({user: req.user._id, _id: req.params.postid}
  , {
    title: req.body.title,
    article: req.body.article,
    tags: req.body.tags
  }, {
    new: true,
    runValidators: true
  }, function (err, updatedPost) {
    (err) ? req.flash('error', 'Error updating post') : req.flash('success', 'Post updated')
    res.redirect('/user/' + req.user.id)
  }
  )
})

router.get('/:userid/comments', function (req, res) {
  User
    .findOne({_id: req.params.userid})
    .populate(
    { path: 'comments',
      populate: { path: 'postId' }
    })
    .exec(function (err, myComments) {
      if (err) return res.status(500).render({errMsg: err})
      console.log('returned object ', myComments)
      res.render('post/commentview', {comments: myComments})
    })
})

  /* returns specific user's post */
router.get('/:userid', function (req, res) {
  User
    .findOne({_id: req.params.userid})
    .populate('posts')
    .exec(function (err, myarticles) {
      if (err) return res.status(500).render({errMsg: err})
      res.render('post/articleview', {articles: myarticles})
    })
})

/* returns all posts */
router.get('/', function (req, res) {
  Post.find({}).populate('user').exec(function (err, posts) {
    if (err) {
      req.flash('error', 'error loading homepage...:(')
      res.status(500)
    } else {
      res.render('post/articleview', {articles: posts})
    }
  })
})

router.delete('/:userid/delete/:postid', (req, res) => {
  if (!userVerification(req.params.userid, req.user._id)) {
    req.flash('error', 'Unauthorised')
    res.redirect('/auth/login')
  } else {
    Post.findByIdAndRemove(req.params.postid, function (err, post) {
      if (err) return res.status(500).render({ errorMsg: err })
      User.findByIdAndUpdate(
        req.user._id,
        {'$pull': { posts: post._id }}, {
          new: true,
          runValidators: true
        }, function (err, remainingPosts) {
          (err) ? req.flashreq.flash('error', 'Delete unsuccesful') : req.flash('success', 'Post deleted')
          res.redirect('/user/' + req.user.id)
        }
      )
    })
  }
})

module.exports = router
