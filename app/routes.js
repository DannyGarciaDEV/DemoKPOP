
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary.js');
const cloudinaryProfile = require('../config/cloudinaryProfile.js'); // For profile pics
const ObjectId = require('mongodb').ObjectID;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { body, validationResult } = require('express-validator');

module.exports = function (app, passport, db) {

  // Normal Routes ===============================================================

// Home page (or other existing routes)
app.get('/', (req, res) => {
  db.collection('events').find().toArray((err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching events');
    }
    res.render('index.ejs', { events: result, user: req.user }); // your normal homepage
  });
});



  app.get('/calendar', (req, res) => {
    db.collection('events').find().toArray((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching events');
      }
      res.render('calendar.ejs', { events: result, user: req.user });
    });
  });

    app.get('/map', (req, res) => {
    db.collection('events').find().toArray((err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error fetching events');
      }
      res.render('map.ejs', { events: result, user: req.user });
    });
  });

app.post('/profile/edit', isLoggedIn, upload.single('profilePicture'), async (req, res) => {
  try {
    const updates = {
      'local.nameUser': req.body.nameUser
    };

    // Upload profile picture if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinaryProfile.uploader.upload_stream(
          { resource_type: 'image', folder: 'profile_pics' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        ).end(req.file.buffer);
      });

      updates['local.profilePicture'] = result.secure_url;
    }

    // Update user in MongoDB
    await db.collection('users').updateOne(
      { _id: req.user._id },
      { $set: updates }
    );

    res.redirect('/profile');
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).send('Profile update failed.');
  }
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


  app.put('/event/:eventId/messages/:messageId', isLoggedIn, async (req, res) => {
    const { eventId, messageId } = req.params;
    const { text } = req.body;
    const currentUser = req.user?.local?.email;
  
    if (!ObjectId.isValid(eventId) || !ObjectId.isValid(messageId)) {
      return res.status(400).send('Invalid ID');
    }
  
    try {
      const message = await db.collection('messages').findOne({ _id: new ObjectId(messageId) });
  
      if (!message) {
        return res.status(404).send('Message not found');
      }
  
      if (message.createdBy !== currentUser) {
        return res.status(403).send('Not authorized to edit this message');
      }
  
      await db.collection('messages').updateOne(
        { _id: new ObjectId(messageId) },
        { $set: { content: text, editedAt: new Date() } }
      );
  
      res.status(200).send('Message updated');
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal server error');
    }
  });


  app.get('/event/:eventId', function (req, res) {
    if (!ObjectId.isValid(req.params.eventId)) {
      return res.status(400).send(`Event ${req.params.eventId} not found`);
    }
  
    const eventId = ObjectId(req.params.eventId);
  
    // Find the event
    db.collection('events').findOne({ _id: eventId }, (err, event) => {
      if (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
  
      if (!event) {
        return res.status(404).send(`Event ${req.params.eventId} not found`);
      }
  
      // Find messages for the event
      db.collection('messages').find({ eventId: eventId }).toArray((err, messages) => {
        if (err) {
          console.log(err);
          return res.status(500).send('Internal Server Error');
        }
  
        // Find attendees for the event
        db.collection('event_attendees').find({ eventId: eventId }).toArray((err, attendees) => {
          if (err) {
            console.log(err);
            return res.status(500).send('Internal Server Error');
          }
  
          // Check if the logged-in user is attending
          let isAttending = false;
          if (req.user) {
            isAttending = attendees.some(att => att.userId.toString() === req.user._id.toString());
          }
  
          // Render the event page
          res.render('event.ejs', {
            event: event,
            messages: messages || [],
            attendees: attendees || [],
            user: req.user?.local?.email,
           
            isAttending: isAttending
          });
        });
      });
    });
  });

  app.delete('/event/:eventId/', isLoggedIn, async (req, res) => {
    const eventId = req.params.eventId;
    const currentUser = req.user?.local?.email || req.user?.email;
  
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send('Invalid event ID');
    }
  
    try {
      const event = await db.collection('events').findOne({ _id: new ObjectId(eventId) });
  
      if (!event) {
        return res.status(404).send('Event not found');
      }
  
      // Debugging logs
      console.log('Event createdBy:', event.createdBy);
  
  
 
      // Delete the event and related collections
      await db.collection('events').deleteOne({ _id: new ObjectId(eventId) });
      await db.collection('messages').deleteMany({ eventId: new ObjectId(eventId) });
      await db.collection('event_attendees').deleteMany({ eventId: new ObjectId(eventId) });
  
      res.status(200).send('Event deleted');
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).send('Internal Server Error');
    }
  });
 

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
      nameUser: req.user.local.nameUser
    },
    {"$set": {
      eventId: eventId,
      user: req.user.local.email,
      nameUser: req.user.local.nameUser,
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
      nameUser: req.user.local.nameUser,
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

const validateEvent = [
  body('summary').notEmpty().withMessage('Summary is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('startDate').isISO8601().toDate().withMessage('Start date must be valid'),
  body('endDate').isISO8601().toDate().withMessage('End date must be valid'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description must be a string and less than 1000 characters'),

  ];app.post('/event', isLoggedIn, upload.single('image'), validateEvent, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
let { summary, location, city, description, startDate, endDate, imageUrl } = req.body;
   
  
    try {
      if (req.file) {
        imageUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: 'image' },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                return reject('Error uploading image');
              }
              resolve(result.secure_url);
            }
          );
          req.file.stream.pipe(uploadStream);
        });
      }
  
      const newEvent = {
        summary,
        description,
          location,
  city,
        start: {
          dateTime: new Date(startDate).toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: new Date(endDate).toISOString(),
          timeZone: 'America/New_York',
        },
        imageUrl,
      };
  
  
      const eventData = {
        ...newEvent,
        
        createdBy: req.user._id,
        user: req.user.local.email,
        nameUser: req.user.local.nameUser

      };
  
      
      const result = await db.collection('events').insertOne(eventData);
  
   res.redirect(`/event/${result.insertedId}`);
    } catch (err) {
      console.error('Event creation error:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  

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
        nameUser: req.user.local.nameUser
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
// Count attendees for a specific event
app.get('/event/:eventId/count', isLoggedIn, async (req, res) => {
  const eventId = req.params.eventId;

  if (!ObjectId.isValid(eventId)) {
    return res.status(400).send('Invalid event ID');
  }

  try {
    const count = await db.collection('event_attendees').countDocuments({
      eventId: new ObjectId(eventId)
    });
    res.status(200).json({ eventId, attendeeCount: count });
  } catch (err) {
    console.error('Error counting attendees:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/event/:eventId/toggle-attend', isLoggedIn, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user._id;

  if (!ObjectId.isValid(eventId)) {
    return res.status(400).send('Invalid event ID');
  }

  try {
    const existing = await db.collection('event_attendees').findOne({
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId)
    });

    if (existing) {
      await db.collection('event_attendees').deleteOne({
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId)
      });
      return res.status(200).json({ attending: false });
    } else {
      await db.collection('event_attendees').insertOne({
        eventId: new ObjectId(eventId),
        userId: new ObjectId(userId)
      });
      return res.status(201).json({ attending: true });
    }
  } catch (err) {
    console.error('Error toggling attendance:', err);
    res.status(500).send('Internal Server Error');
  }
});
// Get attendee counts for all events
app.get('/events/counts', isLoggedIn, async (req, res) => {
  try {
    const counts = await db.collection('event_attendees').aggregate([
      {
        $group: {
          _id: '$eventId',
          attendeeCount: { $sum: 1 }
        }
      }
    ]).toArray();

    res.status(200).json(counts);
  } catch (err) {
    console.error('Error getting counts:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Add an attendee for a specific event
app.post('/event/:eventId/attend', isLoggedIn, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user._id;

  if (!ObjectId.isValid(eventId)) {
    return res.status(400).send('Invalid event ID');
  }

  try {
    // Check if already attending
    const existing = await db.collection('event_attendees').findOne({
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId)
    });

    if (existing) {
      return res.status(409).send('Already attending this event');
    }

    await db.collection('event_attendees').insertOne({
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId)
    });

    res.status(201).send('Attendance recorded');
  } catch (err) {
    console.error('Error adding attendee:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Remove an attendee for a specific event
app.delete('/event/:eventId/attend', isLoggedIn, async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.user._id;

  if (!ObjectId.isValid(eventId)) {
    return res.status(400).send('Invalid event ID');
  }

  try {
    const result = await db.collection('event_attendees').deleteOne({
      eventId: new ObjectId(eventId),
      userId: new ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).send('Attendance record not found');
    }

    res.status(200).send('Attendance removed');
  } catch (err) {
    console.error('Error removing attendance:', err);
    res.status(500).send('Internal Server Error');
  }
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
    user.local.nameUser = undefined;
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
// Any other non-existing route goes here:

