const mongoose = require('mongoose')
mongoose.Promise = require('bluebird');
const Schema = mongoose.Schema;
const zlabDocsSchema = new Schema({
  documentname: { type: String },
  department: { type: String },
  documenttype: { type: String },
  imageformats: { type: String },
  imagefeature: { type: String },
  videoformat:{type:String},
  resolutions:{type:String},
  fileformats:{type:String},
  tagging:{type:Array},
  filepath:{type:String},
  filedetails:{type:Object},
  addedOn: { type: Date, default: Date.now },
});
const zlabDocs = mongoose.model('zlabDocs', zlabDocsSchema)
module.exports = zlabDocs;