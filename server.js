const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/views/index.html");
})



const port = process.env.PORT || 3000;

const listener = app.listen(port, function() {
    console.log("Listening on port " + listener.address().port);
});