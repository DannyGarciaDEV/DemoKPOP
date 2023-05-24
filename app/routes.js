const { createEvent } = require('../config/googleCloud.js');
const ObjectId = require('mongodb').ObjectID;
const getVideoId = require('get-video-id')




module.exports = function (app, passport, db) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    db.collection('events').find().toArray((err, result) => {
      if (err) return console.log(err);
      res.render('index.ejs', { events: result, user: req.user });
    });
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, async function (req, res) {
    const dbEvents = db.collection('events').find({ createdBy: req.user._id } ).toArray();
      // TODO get the events that the user is attending to
    const eventIdsUserIsAttending = (await db.collection('event_attendees').find({userId: req.user._id}).toArray()).map(e => e.eventId);
    const eventsAttending = await db.collection('events').find({_id: { "$in": eventIdsUserIsAttending }}).toArray();
      // Events created by the user
      res.render('profile.ejs', { events: dbEvents, user: req.user, userId: req.user._id, eventsAttending});
  });


  app.get('/practice', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('practice.ejs', {
        user: req.user,
        messages: result
      })
    })
  });

  app.get('/events', isLoggedIn, function (req, res) {
    db.collection('events').find().toArray((err, result) => {
      if (err) return console.log(err);
      res.render('events.ejs', { events: result });
    });
  });



  app.get('/forum', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('forum.ejs', {
        user: req.user,
        messages: result
      })
    })
  });


  app.get('/createEvent', isLoggedIn, function (req, res) {
    db.collection('events').find({ createdBy: req.user._id }).toArray((err, dbevents) => {
      if (err) return console.log(err)
      res.render('createEvent.ejs', {
        user: req.user,
        events: dbevents
      })
    })
  });




  app.get('/moreEvents', isLoggedIn, function (req, res) {
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('moreEvents.ejs', {
        user: req.user,
        messages: result
      })
    })
  });


  app.get('/event/:eventId', function (req, res) {
    if (ObjectId.isValid(req.params.eventId)) {
      const eventId = ObjectId(req.params.eventId);
      db.collection('events').findOne({ _id: eventId }, (err, event) => {
        if (err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
          return;
        }
        if (!event) {
          res.status(404).send(`Event ${req.params.eventId} not found`);
        }
        db.collection('messages').find({ eventId: eventId }).toArray((err, messages) => {
          if (err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
            return;
          }
          // TODO Get the attendees from the database
          db.collection('event_attendees').find({ eventId: eventId }).toArray((err, attendees) => {
            if (err) {
              console.log(err);
              res.status(500).send('Internal Server Error');
              return;
            }
            res.render('event.ejs', {
              event: event,
              messages: messages || [],
              attendees: attendees || [],
              user: req.user?.local?.email
            });
          });
        });
      });
    } else {
      res.status(400).send(`Event ${req.params.eventId} not found`);
    }
  })

  // POST to attend an event
  app.post('/event/:eventId/attend', isLoggedIn, (req, res) => {
    if (!ObjectId.isValid(req.params.eventId)) {
      return res.status(400).send(`Invalid event ID: ${req.params.eventId}`);
    }
    const eventId = ObjectId(req.params.eventId);

    db.collection('event_attendees').update({
      eventId: eventId,
      user: req.user.local.email,
      userId: req.user._id,
    },
    {"$set": {
      eventId: eventId,
      user: req.user.local.email,
      userId: req.user._id,
      createdAt: new Date().toISOString(),
    }},
    { upsert: true }, (err, event_attend) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
      res.send(event_attend);
    });
  });
  // Save into event_attendees collection

  app.post('/event/:eventId/message', isLoggedIn, (req, res) => {
    if (!ObjectId.isValid(req.params.eventId)) {
      return res.status(400).send(`Invalid event ID: ${req.params.eventId}`);
    }
    // validate there is content to save
    if(!req.body.content || req.body.content == "") {
      return res.status(400).send('Message content cannot be empty');
    }

    const eventId = ObjectId(req.params.eventId);

    db.collection('messages').save({
      content: req.body.content,
      // TODO update to have name / username
      createdBy: req.user.local.email,
      createdAt: new Date().toISOString(),
      eventId: eventId,
    }, (err, newMessage) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
      res.send(newMessage);
    });
  });



  app.post('/event', isLoggedIn, function (req, res) {
    const newEvent = {
      'summary': req.body.summary,
      // 'description': req.body.description + `\n\nCreated by ${req.user.local.email}`,
      'location': req.body.location,
      'start': {
        'dateTime': new Date(req.body.startDate).toISOString(),
        'timeZone': 'America/New_York',
      },
      'end': {
        'dateTime': new Date(req.body.endDate).toISOString(),
        'timeZone': 'America/New_York',
      },
    };
    createEvent(newEvent).then(calendarResult => {
      // With the calendarResult, save the ID in the database along with the event details
      const { id } = getVideoId(req.body.videoUrl)
      db.collection('events').save({
        ...newEvent,
        gCalendarMetadata: {
          id: calendarResult.data.id,
          htmlLink: calendarResult.data.htmlLink,
          iCalUID: calendarResult.data.iCalUID,

        },
        videoId: id,
        createdBy: req.user._id,
        user: req.user.local.email,
      }, (err, writeResult) => {
        if (err) throw err
        res.redirect(`/event/${writeResult.ops[0]._id}`);
      });

    }).catch(err => {
      res.status(500).send(err);
    })
  })









  app.post('/videoId', (req, res) => {
    db.collection('videoId').save({ post: req.body.videoId }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })




  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

   app.post('/messagesForum', (req, res) => {
     db.collection('messagesForum').save({ name: req.body.name, msg: req.body.msg }, (err, result) => {
       if (err) return console.log(err)
       console.log('saved to database')
       res.redirect('/forum')
     })
   })

  app.put('/messages', (req, res) => {
    db.collection('messages')
      .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
        $set: {
          thumbUp: req.body.thumbUp + 1
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })


  // counter routes how many people are showing 


  app.post('/counter', (req, res) => {
    db.collection('counter').save({ events: result, user: req.user, counter: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/events')
    })
  })


  app.put('/counter', (req, res) => {
    const objectId = req.body.objectId;
    db.collection('counter')
      .findOneAndUpdate(
        { _id: objectId, user: req.body.user },
        { $inc: { counter: 1 } },
        { sort: { _id: -1 }, upsert: true }
      )
      .then(result => {
        res.send(result);
      })
      .catch(err => {
        console.error('Error updating counter:', err);
        res.status(500).send('An error occurred');
      });
  });

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}

