'use strict';

const mysql = require('mysql2/promise');
require('dotenv').config();
const pool = mysql.createPool(process.env.DB);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const withAuth = require('../middleWare/withAuth');
const { body, query, param, sanitizeParam, sanitizeBody, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

function idGenerator() {
  const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const randFunc = () => possibleChars[Math.floor(Math.random() * 62)]; 
  const idString = [];
    while (idString.length < 25) {
      idString.push(randFunc());
    }
  return idString.join('');
};

module.exports = function(app) {
  app.route('/')
  .get(function(req, res ) {
    res.redirect('/polls?');
  })
  app.route('/polls?')
    .get([
      query()
        .custom(function(arg1, queryObj) {
          Object.keys(queryObj.req.query).forEach(item => {
            if (item !== 'resetPass') {
              throw new Error('Invalid query');
            } else {
              queryObj.req.query.resetPass = escape(queryObj.req.query.resetPass);             
            }
          })
          return true;
        }),
    ], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()[0].msg});
        return;
      } 
      if (req.query.resetPass !== undefined) {
        pool.query(`SELECT Email FROM usrs WHERE Email='${req.query.resetPass}'`)
        .then(dta => {
          if (dta[0].length === 0) {
            res.status(404).json({error: 'Email not found'});
          } else {
            res.status(200).sendFile(process.cwd() + '/views/index.html');
          }
        }).catch(err => {
          res.status(500).json({error: err}); 
        })
      } else {
        res.status(200).sendFile(process.cwd() + '/views/index.html');
      }
  })
  app.route('/api/register')
    .post([
      body('email')
        .trim()
        .isLength({max: 100}).withMessage('Email length of 100 characters has been exceeded'),
      sanitizeBody('email')
        .escape(),
      body('password')
      .trim()
      .isLength({max: 60}).withMessage('Password length of 60 characters has been exceeded'),
    sanitizeBody('password')
      .escape(),
    ], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()[0].msg});
        return;
      } 
      pool.query(`SELECT Email FROM usrs WHERE Email='${req.body.email}'`)
      .then(checkEmail => {
        if (checkEmail[0].length === 1) {
          res.status(400).json({error: 'Email already exists'});
        } else {
          const saltRounds = 10;
          bcrypt.genSalt(saltRounds).then(salt => {
            bcrypt.hash(req.body.password, salt).then(hash => {
              pool.query(`INSERT INTO usrs (_id, Email, Password, ResetCode) VALUES ('${idGenerator()}', '${req.body.email}', '${hash}', 'none')`)
              .then(dta => {
                const payload = { email: req.body.email };
                const token = jwt.sign(payload, process.env.SECRET, {
                  expiresIn: '1h'
                });
                res.cookie('token', token, { httpOnly: true });
                res.status(200).json(token);
              }).catch(err => {
                res.status(500).json({error: err});                
              })
            }).catch(err => {
              res.status(500).json({error: err});   
            })
          }).catch(err => {
            res.status(500).json({error: err});
          })
        }
      })
    })
  app.route('/api/login')
    .post([
      sanitizeBody('email')
        .escape(),
      sanitizeBody('password')
        .escape()
    ], function(req, res) {
      pool.query(`SELECT _id, Email, Password FROM usrs WHERE Email='${req.body.email}'`)
      .then(dta => {
        if (dta[0].length === 0) {
          res.status(404).json({error: 'Email not found'});
          return;
        }
        bcrypt.compare(req.body.password, dta[0][0].Password).then(response => {
          if (response === false) {
            res.status(400).json({error: 'Password does not match email'});
            return;
          } else {
            const payload = { email: req.body.email };
            const token = jwt.sign(payload, process.env.SECRET, {
              expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json(token);
          }
        }).catch(err => {
          res.status(500).json({error: err});
        })
      }).catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/logout')
    .get(function(req, res) {
      res.clearCookie('token');
      res.sendStatus(200);
    })
  app.route('/api/reset')
    .put([
      sanitizeBody('email')
        .escape(),
    ], function(req, res) {
      pool.query(`SELECT Email FROM usrs WHERE Email='${req.body.email}'`)
      .then(usrEmail => {
        if (usrEmail[0].length === 0) {
          res.status(404).json({error: 'Email not found'});
          return;
        }
        const passResetCode = idGenerator();
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds).then(salt => {
          bcrypt.hash(passResetCode, salt).then(hash => {
            pool.query(`UPDATE usrs SET ResetCode='${hash}' WHERE Email='${req.body.email}'`)
            .then(dta => {
              const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'mr.nolank@gmail.com',
                  pass: process.env.RESET,
                },
              });
              const mailOptions = {
                FROM: 'mr.nolank@gmail.com',
                to: req.body.email,
                subject: 'Voting App Password Reset',
                text: `Password reset code is ${passResetCode}. Click the following link to reset your password: https://young-dawn-72099.herokuapp.com//polls?resetPass=${req.body.email}`,
              };
              transporter.sendMail(mailOptions, err => {
                if (err) {
                  res.status(500).json({error: err});
                  return;
                }
              })
              res.status(200).json({msg: 'success'});
            }).catch(err => {
              res.status(500).json({error: err});     
            })
          }).catch(err => {
            res.status(500).json({error: err});   
          })
        }).catch(err => {
          res.status(500).json({error: err});
        })
      }).catch(err => {
        res.status(500).json({error: err});
      })   
    })
  app.route('/api/newPass')
    .put([
      sanitizeBody('email')
        .escape(),
      sanitizeBody('resetCode')
        .escape(),
      body('newPassword')
        .trim()
        .isLength({max: 60}).withMessage('New password length of 60 characters has been exceeded'),
      sanitizeBody('newPassword')
        .escape(),
    ], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()[0].msg});
        return;
      }
      pool.query(`SELECT Email, Password, ResetCode FROM usrs WHERE Email='${req.body.email}'`)
      .then(dta => {
        if (dta[0].length === 0) {
          res.status(404).json({error: 'Email not found'});
          return;
        };
        bcrypt.compare(req.body.resetCode, dta[0][0].ResetCode).then(response => {
          if (response === false) {
            res.status(400).json({error: 'Invalid Reset Code'});
            return;
          } else {
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds).then(salt => {
              bcrypt.hash(req.body.newPassword, salt).then(hash => {
                pool.query(`UPDATE usrs SET Password='${hash}', ResetCode='none' WHERE Email='${req.body.email}'`)
                .then(dta => {
                  res.status(200).json({msg: 'success'});
                }).catch(err => {
                  res.status(500).json({error: err});             
                })
              }).catch(err => {
                res.status(500).json({error: err}); 
              })
            }).catch(err => {
              res.status(500).json({error: err}); 
            })
          }
        }).catch(err => {
          res.status(500).json({error: err});
        })
      }).catch(err => {
        res.status(500).json({error: err});        
      })
    })
  app.route('/api/checkToken')
    .get(withAuth, function(req, res) {
      res.sendStatus(200);
    })
  app.route('/api/newPoll')
    .post(withAuth, [
      body('pollName')
        .trim()
        .isLength({max: 100}).withMessage('Poll name limit of 100 characters has been exceeded'),
      sanitizeBody('pollName')
        .escape(),
      sanitizeBody('user')
        .escape(),
      body('entries')
        .trim()
        .isLength({max: 700}).withMessage('Poll entries limit has exceeded the maximum size allowed'),
      sanitizeBody('entries')
        .escape()
    ], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()[0].msg}); 
        return;
      } 
      pool.query('SHOW TABLES')
      .then(dta => {
        const checkTables = [];
        dta[0].map(item => {
          checkTables.push(item.Tables_in_heroku_62f465079584d76);
        })
        const entries = req.body.entries.split(';');
        for (let i = 0; i < entries.length; i++) {
          if (entries[i].length > 50) {
            res.status(400).json({error: 'Entry limit of 50 characters has been exceeded'});
            return;
          }
        }
        const modifyEntries = [];
        entries.map(item => {
          if (item !== '') {
            modifyEntries.push({name: item, count: 0});
          }
        });
        let findDuplicates = modifyEntries.map(item => item.name);
        findDuplicates = findDuplicates.filter((item, index, arr) => arr.indexOf(item) != index);
        if (findDuplicates.length !== 0) {
          res.status(400).json({error: 'Cannot Create Duplicate Poll Entires'});
          return;
        }
        if (checkTables.includes('polls') === false) {
        pool.query('CREATE TABLE polls (_id VARCHAR(26), _ips VARCHAR(8000), Name VARCHAR(100), User VARCHAR(100), PollInfo VARCHAR(8000))')
        .then(dta => {
          pool.query(`INSERT INTO polls (_id, Name, User, PollInfo) VALUES ('${idGenerator()}', '${req.body.pollName}', '${req.body.user}', '${JSON.stringify(modifyEntries)}')`)
          .then(dta => {
            res.status(200).json({msg: 'Success'});
          }).catch(err => {
            res.status(500).json({error: err});
          })
        }).catch(err => {
          res.status(500).json({error: err});
        })
        } else {
          pool.query(`SELECT Name FROM polls WHERE Name='${req.body.pollName}'`)
          .then(dta => {
            if (dta[0].length > 0) {
              res.status(400).send({error: 'Poll Name Already Exists'});
              return;
            }
            pool.query(`INSERT INTO polls (_id, Name, User, PollInfo) VALUES ('${idGenerator()}', '${req.body.pollName}', '${req.body.user}', '${JSON.stringify(modifyEntries)}')`)
            .then(dta => {
              res.status(200).json({msg: 'Success'});
            }).catch(err => {
              res.status(500).json({error: err});   
            })
          }).catch(err => {
            res.status(500).json({error: err});  
          })
        }
      })
    })
  app.route('/api/getPolls')
    .get(function(req, res) {
    pool.query('SELECT Name, _id FROM polls')
    .then(dta => {
      res.status(200).json({data: dta[0]});
    }).catch(err => {
      if (err.message === `Table 'heroku_62f465079584d76.polls' doesn't exist`) {
        res.status(200).json({data: []});
        return;
      }
      res.status(500).json({error: err}); 
    })
  })
  app.route('/api/:checkId')
    .get([
      sanitizeParam('checkId')
        .escape(),
    ], function(req, res) {
      pool.query(`SELECT * FROM polls WHERE _id='${req.params.checkId}'`)
      .then(dta => {
        if (dta[0].length === 0) {
          res.status(404).json({error: 'Poll not found'});
          return;
        }
        res.status(200).json({msg: 'Success'});
      }).catch(err => {
        res.status(500).json({error: err});
      })
    })
    app.route('/polls/:id')
    .get([
      sanitizeParam('id')
        .escape(),
    ], function(req, res) {
      res.status(200).sendFile(process.cwd() + '/views/index.html');
    })
    app.route('/api/polls/:id')
    .get([
      sanitizeParam('id')
        .escape(),
    ], function(req, res) {
      pool.query(`SELECT * FROM polls WHERE _id='${req.params.id}'`)
      .then(dta => {
        if (dta[0].length === 0) {
          res.status(404).json({error: 'Poll not found'});
          return;
        }
        res.status(200).json({data: dta[0]});
      }).catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/handleVote')
    .put([
      sanitizeBody('name')
        .escape(),
      sanitizeBody('item')
        .escape()
    ], function(req, res) {
      pool.query(`Select _ips, Name, PollInfo FROM polls WHERE Name='${req.body.name}'`)
      .then(dta => {
        const ipA = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let ipAdrs = JSON.parse(dta[0][0]._ips);
        if (ipAdrs !== null && ipAdrs.includes(ipA) === true) {
          res.status(400).json({error: 'Only one vote per poll is allowed'});
          return;
        }
        const pollIfo = JSON.parse(dta[0][0].PollInfo);
        const checkPolIfo = pollIfo.filter(itm => itm.name === req.body.item);
        if (checkPolIfo.length === 0) {
          res.status(404).send({error: 'Poll entry not found'});
          return;
        }
        if (ipAdrs !== null) {
          ipAdrs.push(ipA);
        }
        if (ipAdrs === null) {
          ipAdrs = [ipA];
        }
        pollIfo.forEach(etry => {
          if (etry.name === req.body.item) {
            etry.count = etry.count + 1;
          }
        }) 
        pool.query(`UPDATE polls SET _ips='${JSON.stringify(ipAdrs)}', PollInfo='${JSON.stringify(pollIfo)}' WHERE Name='${req.body.name}'`)
        .then(response => {
          pool.query(`SELECT Name, PollInfo FROM polls WHERE Name='${req.body.name}'`)
          .then(dta => {
            res.status(200).json({data: dta[0]});
          }).catch(err => {
            res.status(500).json({error: err});  
          })
        }).catch(err => {
          res.status(500).json({error: err}); 
        })
      }).catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/userPolls/:usrEmail')
    .get(withAuth, [
      sanitizeParam('usrEmail')
      .escape(),
    ], function(req, res) {
      pool.query(`SELECT _id, Name FROM polls WHERE User='${req.params.usrEmail}'`)
      .then(dta => {
        res.status(200).json({data: dta[0]});
      })
      .catch(err => {
        if (err.message === `Table 'heroku_62f465079584d76.polls' doesn't exist`) {
          res.status(200).json({data: []});
          return;
        }
        res.status(500).json({error: err});
      })
    })
  app.route('/api/userPolls/edit/:pollId')
    .get(withAuth, [
      sanitizeParam('pollId')
      .escape(),
    ], function(req, res) {
      pool.query(`SELECT PollInfo FROM polls WHERE _id='${req.params.pollId}'`)
      .then(dta => {
        const userPollDta = JSON.parse(dta[0][0].PollInfo).map(item => item.name);
        res.status(200).json({data: userPollDta});
      })
      .catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/userPolls/delete/:pollId')
    .delete(withAuth, [
      sanitizeParam('pollId')
      .escape(),
    ], function(req, res) {
      pool.query(`DELETE FROM polls where _id='${req.params.pollId}'`)
      .then(dta => {
        pool.query('SELECT Name, _id FROM polls')
        .then(dta => {
          res.status(200).json({data: dta[0]});
        })
        .catch(err => {
          res.status(500).json({error: err});
        })
      })
      .catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/userPolls/deleteEntry/:usrEmail/:pollId/:entryName')
    .put(withAuth, [
      sanitizeParam('usrEmail')
      .escape(),
      sanitizeParam('pollId')
      .escape(),
      sanitizeParam('entryName')
      .escape(),
    ], function(req, res) {
      pool.query(`SELECT PollInfo FROM polls WHERE _id='${req.params.pollId}'`)
      .then(dta => {
        if (JSON.parse(dta[0][0].PollInfo).length < 3) {
          res.status(400).json({error: 'Poll must contain at least two entries'});
          return;
        }
        const delPollEntry = JSON.parse(dta[0][0].PollInfo).filter(item => item.name !== req.params.entryName);
        pool.query(`UPDATE polls SET PollInfo='${JSON.stringify(delPollEntry)}' WHERE _id='${req.params.pollId}'`)
        .then(dta => {
          pool.query(`SELECT PollInfo FROM polls WHERE _id='${req.params.pollId}'`)
          .then(dta => {
            const userPollDta = JSON.parse(dta[0][0].PollInfo).map(item => item.name);
            res.status(200).json({data: userPollDta});
          })
          .catch(err => {
            res.status(500).json({error: err});
          })
        })
        .catch(err => {
          res.status(500).json({error: err});
        })
      })
      .catch(err => {
        res.status(500).json({error: err});
      })
    })
  app.route('/api/userPolls/addEntry/:usrEmail/:pollId/:entryName')
    .put(withAuth, [
      sanitizeParam('usrEmail')
      .escape(),
      sanitizeParam('pollId')
      .escape(),
      param('entryName')
      .trim()
      .isLength({max: 50}).withMessage('Entry limit of 50 characters has been exceeded'),
      sanitizeParam('entryName')
      .escape(),
    ], function(req, res) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({error: errors.array()[0].msg}); 
        return;
      } 
      console.log(req.params);
      pool.query(`SELECT PollInfo FROM polls WHERE _id='${req.params.pollId}'`)
      .then(dta => {
        const pollDta = JSON.parse(dta[0][0].PollInfo);
        console.log(pollDta);
        pollDta.push({name: req.params.entryName, count: 0});
        pool.query(`UPDATE polls SET PollInfo='${JSON.stringify(pollDta)}' WHERE _id='${req.params.pollId}'`)
        .then(dta => {
          pool.query(`SELECT PollInfo FROM polls WHERE _id='${req.params.pollId}'`)
          .then(dta => {
            const userPollDta = JSON.parse(dta[0][0].PollInfo).map(item => item.name);
            res.status(200).json({data: userPollDta});
          })
          .catch(err => {
            res.status(500).json({error: err});
          })
        })
        .catch(err => {
          res.status(500).json({error: err});
        })
      })
      .catch(err => {
        res.status(500).json({error: err});
      })
    })
};