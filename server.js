var express = require('express');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var path = require('path');
app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// define Schema variable
var Schema = mongoose.Schema;
// define Post Schema
var PostSchema = new mongoose.Schema({
 name: {type: String, required: true },
 text: {type: String, required: true },
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });
// define Comment Schema
var CommentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 name: {type: String, required: true },
 text: {type: String, required: true }
}, {timestamps: true });
// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


app.get('/', function (req, res){
 Post.find({}, false, true)
 .populate('comments')
 .exec(function(err, posts) {
      res.render('index', {posts: posts});
        });
});

app.post('/posts', function(req, res) {
    console.log("POST DATA", req.body);
    var post = new Post({name: req.body.name, text: req.body.text});
    post.save(function(err) {
      if(err) {
        console.log('Error', err);
      } else {
        console.log('Successfully added a post!');
    res.redirect('/');
        }
    })
})

app.post('/posts/:id', function (req, res){
  console.log("POST DATA", req.body);
  Post.findOne({_id: req.params.id}, function(err, post){
         var comment = new Comment(req.body);
         comment._post = post._id;
         post.comments.push(comment);
         Post.update({ _id: post._id }, { $push: { comments: comment }}, function(err){
           console.log('Post error', err)
		       });
         comment.save(function(err){
            if(err) { console.log('Comment error', err); }
            else {
            res.redirect('/');
            }
         });
 });
});


app.listen(8000, function() {
    console.log("listening on port 8000");
})
