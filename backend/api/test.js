var express = require('express');
var router = express.Router();

router.get( "/", (req, res) => {
    res.write( "Hello World");
    res.end();
});

module.exports = router;
