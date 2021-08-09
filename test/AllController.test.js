const path = require('path');
const request = require('supertest');
var ModelInitializer = require('../config/dbConnection.js');
const documetUploader= require('../businessController/documentUploaderController');
const zLabDocModel=require('../model/zlabdocsModel.js');
const  urlRoot='http://localhost:5000';
const should = require('chai').should();
const expect = require('chai').expect;
process.env.NODE_EN='test'
describe('Z-lab Document management', () => {
    before(()=>{
        ModelInitializer.initializeModel().then((res)=>{
          }).catch((err)=>{
          })      
    })
    after((done)=>{
        zLabDocModel.remove({'documentname':'test'},(err,doc)=>{
            if(err){
                done(err)
            }else{
                done()
            }
          })  
    })
    it('should check document type and return upload path', () => {
        let mockType = 'file';
        let path = documetUploader.checkDocType(mockType)
        expect(path).to.be.a('string');
    })
    it('should delete and remove uploaded document and file', (done) => {
        zLabDocModel.findOne({})
            .sort({ _id: -1 })
            .limit(1)
            .exec((err, doc) => {
                let lastItems = JSON.parse(JSON.stringify(doc));
                let lastID = lastItems._id;
                request(urlRoot)
                    .delete('/deletedocument')
                    .query({ id: lastID })
                    .end((err, res) => {
                        should.not.exist(err)
                        expect(res.status).to.be.equal(200)
                        expect(res.body).to.be.a('string').equal('delete success')
                        done()
                    });
            })
    })
    it('should Add new document and upload a file into z-lab folder', (done) => {
        let filePath = 'public/zlab_files/testimg/test.png'
        let mockData = {
            department: "plantengineering",
            documentname: "test",
            documenttype: "file",
            fileformats: "pdf",
            tagging: ['#2E8B57', '#1569C7']
        }
        request(urlRoot)
            .post('/uploadfile')
            .field(mockData)
            .attach('zlabfile', filePath)
            .end((err, res) => {
                should.not.exist(err)
                expect(res.status).to.be.equal(302)
                res.header['location'].should.include('/documentlist');
                done()
            });
    })
    it('should update existing document only', (done) => {
        let mockData = {
            department: "plantengineering",
            doucmentname: "test update",
            documenttype: "file",
            fileformats: "pdf",
            tagging: ['#2E8B57', '#1569C7'],
            documentID: '5d34aa9f3b75b50ac1eecc55'
        }
        request(urlRoot)
            .put('/updatedocument')
            .send(mockData)
            .end((err, res) => {
                should.not.exist(err)
                expect(res.status).to.be.equal(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').equal('updated')
                done()
            });
    })
    it('should update existing document and file ', (done) => {
        let filePath = 'public/zlab_files/testimg/test.png'
        let mockData = {
            department: "plantengineering",
            doucmentname: "test update",
            documenttype: "file",
            fileformats: "pdf",
            tagging: ['#2E8B57', '#1569C7'],
            documentID: '5d34aa9f3b75b50ac1eecc55',
        }
        request(urlRoot)
            .put('/updatedocument')
            .field(mockData)
            .attach('zlabfile', filePath)
            .end((err, res) => {
                should.not.exist(err)
                expect(res.status).to.be.equal(200)
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('message').equal('updated')
                done()
            });
    })
    it('should return all documents',(done)=>{
        let mockData={
            documentname:'test',
            tagging:['#1569C7','#1569C7'],
            documenttype:null,
            department:null
        }
        request(urlRoot)
        .get('/getalldocuments')
        .query(mockData)
        .end((err, res) => {
            should.not.exist(err)
            expect(res.status).to.be.equal(200)
            expect(res.body).to.be.an('array')
            expect(res.body).to.be.an('array').not.empty
            done()
        });
    })
    it('should  remove file when given a correct filepath',(done)=>{
        let path='/zlab_files/testimg/test copy.png'
        documetUploader.removeFile(path).then((response)=>{ 
            done()
        }).catch((err)=>{
            done(err)
        })
    })
    it('should return and object of a search filter for db operations',()=>{
        let mockData={
            documentname:'test',
            tagging:['#FFF','#2FE'],
            documenttype:'file',
            department:'rental'
        }
       let response= documetUploader.getClientFilter(mockData);
       should.exist(response)
       expect(response).to.be.an('object')
       expect(response).to.have.property('$or')
    })
   
})