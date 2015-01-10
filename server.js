var express = require('express');
var app = express();
var mongojs = require("mongojs");
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


var uri = "localhost",
    db = mongojs.connect(uri, ["proxi"]);

server.listen(80);

app.use(express.static(process.cwd() + '/'));

function getAllNearbyPeople(socket)
{
    console.log("Finding people near " + socket.id + " at " + socket.lat + ", " + socket.long);
    var ids = [];
    
    for (x in smatrix)
    {
        console.log("Checking " + smatrix[x].id + " against " + socket.id);
        if (smatrix[x].id !== socket.id)
            if (isInCircle(socket.lat, socket.long, 1, smatrix[x].lat, smatrix[x].long, 1))
                ids.push(smatrix[x].id);
    
    }
    console.log("ID list: " + ids);
    return ids;
}

function isInCircle(x1, y1, r1, x2, y2, r2)
{
    r = r1;
    // take smaller radius
    if (r1 > r2)
        r = r2;
    
    // radius is in km, convert to long/lat
    r /= 111;
    
    // get differences in x and y
    xd = x1 - x2;
    xd *= xd;
    yd = y1 - y2;
    yd *= yd
    
    return Math.sqrt(xd + yd) < r;
}

//db.proxi.save({"counter": "red"}, function(err, records) {
//    console.log("error");
//});
//
//db.proxi.find({"color": "red"}, function(err, records) {
//    console.log(records);
//    if (err)
//        console.log("couldn't find your thing");
//    else
//        console.log("no");
//});

function newColor()
{
    return '#'+'0123456789abcdef'.split('').map(function(v,i,a){
  return i>5 ? null : a[Math.floor(Math.random()*16)] }).join('');
}

// handle incoming connections from clients
io.sockets.on('connection', function(socket)
{
    // generate name and color
    socket.name = "Guest"+parseInt(Math.random()*1000);
    socket.color = newColor();
    
    // signal all sockets of the new client
    io.sockets.emit("new_client", {name: socket.name, color: socket.color});

    // when a name is changed
    socket.on('name_change', function(data){
        // TODO: check for no name collision
        
        // keep their old name
        var oldname = socket.name;
            
        // update to their new name
        socket.name = data.name;
        
        // send the name change message to all
        io.sockets.emit("name_change", {name: socket.name, oldname: oldname});
    });
    
    // d/c
    socket.on('disconnect', function(){
//        io.sockets.emit('drop_player', {'id' : id});
    });
});
