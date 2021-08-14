const express = require('express');
const router = express.Router();
const documentBusiness = require('../businessController/documentUploaderController')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});
router.get('/', function (req, res, next) {
  res.render('login', { title: 'Express' });
});
router.get('/documentlist', function (req, res, next) {
  res.render('documentlist');
});
router.get('/newdocument', function (req, res, next) {
  res.render('newdocument')
})
router.get('/viewmap', function (req, res, next) {
  res.render('viewmap')
})
router.get('/testing', function (req, res, next) {
  res.render('mytestfile')
})
router.post('/uploadfile', function (req, res, next) {
  req.body.file = req.files.zlabfile
  documentBusiness.addNewfile(req.body).then((response) => {
    response.fileUploadStatus = `File uploaded`
    if (response.success) {
      res.redirect('/documentlist')
    }
  }).catch((error) => {
    res.render('error', { message: error.message, error: 500, stack: 'file upload failed' })
  })
})
router.put('/updatedocument', function (req, res, next) {

  if (req.files) {
    req.body.file = req.files.zlabfile
    documentBusiness.updateExistingDocumentAndFile(req.body).then((response) => {
      res.status(200).json(response)
    }).catch((err) => {
      res.status(500).json(err)
    })
  } else {
    documentBusiness.updateExistingDocumentOnly(req.body).then((response) => {
      res.status(200).json(response)
    }).catch((err) => {
      res.status(500).json(err)
    })
  }
})
router.get('/getalldocuments', function (req, res, next) {
  documentBusiness.getAllDocuments(req.query)
    .then((response) => {
      res.status(200).json(response);
    }).catch((error) => {
      res.status(500).send(error);
    })
})
router.delete('/deletedocument', function (req, res, next) {
  documentBusiness.deleteDocument(req.query.id).then(() => {
    res.status(200).json('delete success')
  }).catch((err) => {
    res.status(500).json('delete failed')
  })
})
module.exports = router;
