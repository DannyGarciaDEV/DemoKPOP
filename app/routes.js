const { createEvent } = require('../config/googleCloud.js');
const ObjectId = require('mongodb').ObjectID;
const getVideoId = require('get-video-id');

module.exports = function (app, passport, db) {

  // Normal Routes ===============================================================

  app.get('/', (req, res) => {
    db.collection('events').find().toArray((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching events');
      }
      res.render('index.ejs', { events: result, user: req.user });
    });
  });

  // PROFILE SECTION ===========================================================
  app.get('/profile', isLoggedIn, async (req, res) => {
    try {
      const dbEvents = await db.collection('events').find({ createdBy: req.user._id }).toArray();
      const attendingDocs = await db.collection('event_attendees').find({ userId: req.user._id }).toArray();
      const eventIdsUserIsAttending = attendingDocs.map(e => e.eventId);
      const eventsAttending = await db.collection('events').find({ _id: { $in: eventIdsUserIsAttending } }).toArray();
      
      res.render('profile.ejs', {
        events: dbEvents,
        user: req.user,
        userId: req.user._id,
        eventsAttending: eventsAttending
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
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




  


  app.get('/event/:eventId', function (req, res) {
    if (ObjectId.isValid(req.params.eventId)) {
      const eventId = ObjectId(req.params.eventId);
     // If there is an error during the database operation, the code inside the  block is skipped, and the execution continues after this code snippet.
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

  app.put('/messagesForum', (req, res) => {
    db.collection('messagesForum')
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




  app.delete('/event/:eventId/message/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
  
    if (!ObjectId.isValid(id)) {
      return res.status(400).send('Invalid message ID');
    }
  
    try {
      const result = await db.collection('messages').deleteOne({
        _id: new ObjectId(id),
        createdBy: req.user.local.email, // Only the message author can delete
      });
  
      if (result.deletedCount === 0) {
        return res.status(404).send('Message not found or unauthorized');
      }
  
      res.status(200).send('Deleted successfully');
    } catch (err) {
      console.error('Error deleting message:', err);
      res.status(500).send('Server error');
    }
  });

  // counter routes how many people are showing 


  // Counter Routes ============================================================
  app.post('/counter', (req, res) => {
    db.collection('counter').save({ events: req.body.events, user: req.user, counter: 0 }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error saving counter');
      }
      console.log('saved to database');
      res.redirect('/events');
    });
  });

  app.put('/counter', (req, res) => {
    const { objectId, user } = req.body;

    db.collection('counter').findOneAndUpdate(
      { _id: objectId, user },
      { $inc: { counter: 1 } },
      { sort: { _id: -1 }, upsert: true },
      (err, result) => {
        if (err) {
          console.error('Error updating counter:', err);
          return res.status(500).send('An error occurred');
        }
        res.send(result);
      }
    );
  });

  // LOGOUT ====================================================================
  app.get('/logout', (req, res) => {
    req.logout(() => {
      console.log('User has logged out!');
    });
    res.redirect('/');
  });

  // =============================================================================
  // AUTHENTICATE (LOGIN & SIGNUP) =================================================
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));

  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // =============================================================================
  // UNLINK ACCOUNTS ============================================================
  app.get('/unlink/local', isLoggedIn, (req, res) => {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save((err) => {
      res.redirect('/');
    });
  });

};

// Route Middleware to Ensure User is Logged In ================================
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}
