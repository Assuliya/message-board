const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const path = require('path');
app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// define Schema variable
const Schema = mongoose.Schema;

// define Post Schema
const PostSchema = new mongoose.Schema({
 name: {type: String, required: true, minlength: 4 },
 text: {type: String, required: true },
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

mongoose.model('Post', PostSchema);
const Post = mongoose.model('Post');


// define Comment Schema
const CommentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 name: {type: String, required: true, minlength: 4 },
 text: {type: String, required: true }
}, {timestamps: true });

mongoose.model('Comment', CommentSchema);
const Comment = mongoose.model('Comment');


app.get('/', function (req, res){
 Post.find({}, false, true)
 .populate('comments')
 .exec(function(err, posts) {
      res.render('index', {posts: posts});
        });
});

app.post('/posts', function(req, res) {
    console.log("POST DATA", req.body);
    const post = new Post({name: req.body.name, text: req.body.text});
    post.save(function(err) {
      if(err) {
        console.log('Error', err);
				res.render('index', { errors: post.errors });
      } else {
        console.log('Successfully added a post!');
    res.redirect('/');
        }
    })
})

app.post('/posts/:id', function (req, res){
  console.log("POST DATA", req.body);
  Post.findOne({_id: req.params.id}, function(err, post){
         const comment = new Comment(req.body);
         comment._post = post._id;
         post.comments.push(comment);
         Post.update({ _id: post._id }, { $push: { comments: comment }}, function(err){
           console.log('Post error', err)
		       });
         comment.save(function(err){
            if(err) {
              console.log('Comment error', err);
              res.render('index', { errors: comment.errors });
            }
            else {
            res.redirect('/');
            }
         });
 });
});


app.listen(8000, function() {
    console.log("listening on port 8000");
})
