var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var ModelInitializer = require('./config/dbConnection.js');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

 ModelInitializer.initializeModel().then((res)=>{
   console.log(res)
 }).catch((err)=>{
   console.log(err)
 })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(fileUpload());
app.use(logger('dev'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ limit:'10mb', extended: false }));
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', '/images/app_images/favicon.png')))
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
