const express = require('express')
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cookieParser = require('cookie-parser');
const OpenAI = require('openai');
const fs = require('fs');
const https = require('https');
const http = require('http');

require('dotenv').config();


const connectDB = require('./config/db');
const authenticate = require('./middleware/authenticate');
const authRoutes = require('./routes/authRoutes'); 
const openaiRoutes = require('./routes/openaiRoutes');

const app = express();

connectDB();

const privatekey = fs.readFileSync('/etc/letsencrypt/live/suhbatdosh.com/privkey.pem','utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/suhbatdosh.com/cert.pem','utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/suhbatdosh.com/chain.pem','utf8');


const credentials = {
  key: privatekey,
  cert: certificate,
  ca: ca 
};


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(session({
  secret: 'yourSecretKey121212',
  resave: false,
  saveUnitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1/mydatabase'
  }),
  cookie: {
    maxAge: 2*60000,
    secure: false,
    httpOnly: true
  }
}))

app.use('/auth', authRoutes);
app.use(openaiRoutes);

app.get('/chat', authenticate, (req,res) => {
  res.sendFile(path.join(__dirname, 'public','chat.html'))
});


app.use(express.static(path.join(__dirname, 'public')));

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(443);

const httpApp = express();

httpApp.use((req, res) => {
  res.redirect(301, 'https://${req.headers.host}${req.url}')
})

const httpServer = http.createServer(httpsApp);

httpServer.listen(80);