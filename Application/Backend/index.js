// importing the dependencies
const express = require('express');
//const Prometheus = require('prom-client');
const apiMetrics = require('prometheus-api-metrics');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const knex = require('knex');
require('dotenv').config()

//extra prometheus metrics
// const signInRequests = new Prometheus.Counter({
//   name: 'signin_requests',
//   help: 'Total number of new Sign In',
//   labelNames: ['rcd_signin_requests']
// });

// const signUpRequests = new Prometheus.Counter({
//   name: 'signup_requests',
//   help: 'Total number of new Sign Up',
//   labelNames: ['rcd_signup_requests']
// });


//importing the controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');

//importing utils
const auth = require('./utils/authorization')

//hosts and ports
const portEnv = process.env.PORT;
const portFail = 3000;
const hostPostgresEnv = process.env.DB_HOST ? process.env.DB_HOST : 'localhost';
const portPostgresEnv = process.env.DB_PORT ? process.env.DB_PORT : 5432;

// defining the Express app
const app = express();

//database settings
const db = knex({
  client: 'pg',
  connection: {
    host : hostPostgresEnv,
    port: portPostgresEnv,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    database : process.env.DB_NAME
  }
});


// adding Helmet to enhance API's security
app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

// prometheus api middleware
app.use(apiMetrics())

// endpoints
app.get('/', (req, res) => {
  res.json("RCD Backend API - it's working");
});

app.post('/signin', signin.signinAuthentication(bcrypt, db))

app.post('/register', register.handleRegister(bcrypt, db))

app.get('/profile/:certid', auth.requireAuth, profile.handleProfile(db))

app.post('/profile/:certid', auth.requireAuth, profile.handleSubmit(db))

app.get('/rank', auth.requireAuth, profile.getRank(db))


// starting the server
app.listen(portEnv || portFail, () => {
  console.log(`Server running on http://localhost:${portEnv ? portEnv : portFail}`);
})