const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes/api.js');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cookieParser());

routes(app);

app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const port = process.env.PORT || 3000;

const listener = app.listen(port, function() {
    console.log('Listening on port ' + listener.address().port);
});

module.exports = app;