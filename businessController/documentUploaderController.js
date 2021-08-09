const mongoose = require('mongoose');
const fs = require('fs');
let ObjectID = mongoose.Types.ObjectId;
const zLabDocModel=require('../model/zlabdocsModel.js');
"use strict"
class DocumentUploader{
    static checkDocType(type){
        switch (type) {
            case 'image':
                return '/zlab_files/images'
            case 'video':
                return '/zlab_files/videos'
            case 'file':
                return '/zlab_files/docs'
            default:
                return '/zlab_files';
        }
    }
    static  uploadToFolder(zlabDoc) {
        return new Promise((resolve, reject) => {
            let path = `${DocumentUploader.checkDocType(zlabDoc.documenttype)}/${zlabDoc.file.md5}.${zlabDoc.file.name}`;
            let itemLength = Object.keys(zlabDoc.file).length;
            zlabDoc.path=path.trim();
            if (itemLength == 0) {
                reject(`No file ${itemLength}`)
            } else {
                let myfile = zlabDoc.file; 
                myfile.mv('public'+ path, function (err) {
                    if(err){
                        reject(err)
                    }else{
                       resolve(true)
                    }
                });
            }
        })

    }
    static updateExistingDocumentOnly(data){
        return new Promise((resolve,reject)=>{
            let id =new ObjectID(data.documentID)
            zLabDocModel.findByIdAndUpdate({_id:id},data,(error,doc)=>{
                if(error){
                    reject({ success: false, message: error.message + 'stack: ' + err.stack })
                }else{
                    resolve({ success: true, message: 'updated' })
                }
            })
        })
    }
    static updateExistingDocumentAndFile(data) {
        return new Promise((resolve, reject) => {
            DocumentUploader.uploadToFolder(data).then((response) => {
                if (response) {
                    let id = new ObjectID(data.documentID)
                    data.filepath=data.path;
                    data.filedetails=data.file
                    zLabDocModel.findByIdAndUpdate({ _id: id }, data, (error, doc) => {
                        if (error) {
                            reject({ success: false, message: error.message + 'stack: ' + err.stack })
                        } else {
                            resolve({ success: true, message: 'updated' })
                        }
                    })
                }
            }).catch((err) => {
                reject({ success: false, message: err.message + 'stack: ' + err.stack })
            })
        })
    }
    static addNewfile(data) {
        return new Promise((resolve, reject) => {
            //first upload file
            DocumentUploader.uploadToFolder(data).then((response) => {
                if (response) {
                    //remove binary data for large video
                    data.documenttype == 'video' ? delete data.file.data : ''
                    let newDocument = new zLabDocModel({
                        documentname: data.documentname,
                        department: data.department,
                        documenttype: data.documenttype,
                        imageformats: data.imageformats,
                        imagefeature: data.imagefeature,
                        videoformat:data.videoformat,
                        resolutions: data.resolutions,
                        fileformats: data.fileformats,
                        filedetails: data.file,
                        tagging: data.tagging,
                        filepath: data.path,
                    })
                    newDocument.save((error, res) => {
                        resolve({ success: true, message: 'save' })
                    })
                }
            }).catch((err) => {
                reject({ success: false, message: err.message + 'stack: ' + err.stack })
            })
        })
    }
    static getAllDocuments(dataProperties) {
        return new Promise((resolve, reject) => {
            let search=DocumentUploader.getClientFilter(dataProperties);
            zLabDocModel.count(search).exec((error, docCount) => {
                if (docCount) {
                    zLabDocModel.find(search)
                        .skip(parseInt(dataProperties.start))
                        .limit(parseInt(dataProperties.length))
                        .sort({documentname:1})
                        .exec((error, doc) => {
                            if (error) {
                             return  reject(err)
                            } else if(doc) {
                                doc = JSON.parse(JSON.stringify(doc))
                                let total = doc.length;
                                let newDoc = []
                                for (let i = 0; i < total; i++) {
                                    newDoc.push({
                                        _id: doc[i]._id,
                                        documentname: doc[i].documentname|| 'Not set',
                                        department: doc[i].department|| 'Not set',
                                        documenttype: doc[i].documenttype|| 'Not set',
                                        imageformats: doc[i].imageformats|| 'Not set',
                                        imagefeature: doc[i].imagefeature || 'Not set',
                                        videoformat: doc[i].videoformat || 'Not set',
                                        resolutions: doc[i].resolutions|| 'Not set',
                                        fileformats: doc[i].fileformats|| 'Not set',
                                        filesize: (parseInt(doc[i].filedetails.size/ 1024, 10) + ' KB')  || '',
                                        mimetype:doc[i].filedetails.mimetype || '',  
                                        tagging: doc[i].tagging|| 'Not set',
                                        addedOn: new Date(doc[i].addedOn).toDateString(),
                                        filepath:doc[i].filepath.trim(),
                                        myControl:null
                                    })
                                }
                               return resolve(newDoc)
                            }else{
                                return resolve([])
                            }
                        })
                }else{
                    resolve([])
                }
            })
        })
    }
    static deleteDocument(documentID){
        return new Promise((resolve,reject)=>{
            let id =new ObjectID(documentID);
            zLabDocModel.findByIdAndDelete({_id:id},(err,doc)=>{
                if(err){
                   return reject(err)
                }else{
                    if(doc && doc.filepath){
                    DocumentUploader.removeFile(doc.filepath).then((response)=>{
                       return resolve(response)
                    }).catch((error)=>{
                       return reject(error)
                    })
                }
                }
            })
        })
    }
    static removeFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink('public'+filePath, (error, response) => {
                if(error){
                return  reject(error)
                }
                return resolve(response)
            })
        })
    }
    static getClientFilter(query) {
        if (query.documentname || query.documenttype || query.department || query.tagging) {
            let docname = query.documentname ? new RegExp(query.documentname ,'i')  : null;
            let doctype = query.documenttype ? new RegExp(query.documenttype ,'i' ) : null;
            let department = query.department ? new RegExp(query.department ,'i' ) : null;
            let tagging = query.tagging ? { "$in": query.tagging } : null
            var result = {
                "$or": [{ documentname: docname },
                        {documenttype: doctype},
                        {department:department },
                        {tagging: tagging}]
            };
            return result;
        } else {
            return {}
        }
    };
}
module.exports=DocumentUploader;