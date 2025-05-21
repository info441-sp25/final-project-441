import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import sessions from 'express-session';

import models from './models.js';
import v1Router from './routes/api/v1/apiv1.js';

// To install msal-node-wrapper, run:
// npm install "https://gitpkg.now.sh/kylethayer/ms-identity-javascript-nodejs-tutorial-msal-node-v2-/Common/msal-node-wrapper?main"

import WebAppAuthProvider from 'msal-node-wrapper';
// original msal-node-wrapper code:
// https://github.com/Azure-Samples/ms-identity-javascript-nodejs-tutorial/tree/main/Common/msal-node-wrapper

const authConfig = {
  auth: {
    clientId: "fab2d7fa-4c42-4795-9b28-988cb921fc88",
    authority: "https://login.microsoftonline.com/f6b6dd5b-f02f-441a-99a0-162ac5060bd2",
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    redirectUri: "https://graduated-q0lj.onrender.com/redirect"
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.log(message);
      },
      piiLoggingEnabled: false,
      logLevel: 3
    }
  }
};

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.enable('trust proxy');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://graduated-q0lj.onrender.com');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

// Standard middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
  secret: "this-is-a-secret-key-for-session-use-only",
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: oneDay,
    secure: 'auto',
    sameSite: 'none'
  }
}));

// Inject models into requests
app.use((req, res, next) => {
  req.models = models;
  next();
});

// Azure AD Auth setup
const authProvider = await WebAppAuthProvider.WebAppAuthProvider.initialize(authConfig);
app.use(authProvider.authenticate());

// Login + Logout routes
app.get('/signin', (req, res, next) => {
  return req.authContext.login({
    postLoginRedirectUri: "/"
  })(req, res, next);
});

app.get('/signout', (req, res, next) => {
  return req.authContext.logout({
    postLogoutRedirectUri: "/"
  })(req, res, next);
});

// Auth error handler
app.use(authProvider.interactionErrorHandler());

// API v1 routes
app.use('/api/v1', v1Router);

// Logged-in user identity endpoint
app.get('/users/myIdentity', (req, res) => {
  res.json(req.authContext?.account || null);
});

export default app;