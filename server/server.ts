// src/index.js
import express, {json} from 'express';
import {credential} from 'firebase-admin';
import {initializeApp} from 'firebase-admin/app';
import {getMessaging} from 'firebase-admin/messaging';

const keys = require('./tde2-ucs-disp-moveis-firebase-adminsdk-1lumm-01a4d41080.json');

// Initialize app
initializeApp({
  credential: credential.cert(keys),
  databaseURL: 'https://tde2-ucs-disp-moveis.firebaseio.com',
});

const app = express();
app.use(json());

app.get('/', (_req, res) => {
  res.send('Express + TypeScript Server');
});

app.post('/send', (req, res) => {
  const {title, message, token, data} = req.body;

  getMessaging()
    .send({
      notification: {
        title,
        body: message,
      },
      data,
      token,
    })
    .then(response => {
      res.status(200).json({
        message: 'Successfully sent message',
        token,
      });
      console.log('Successfully sent message:', response);
    })
    .catch(error => {
      res.status(400);
      res.send(error);
      console.log('Error sending message:', error);
    });
});

app.listen(3333, () => {
  console.log(`[server]: Server is running at http://localhost:3333`);
});
