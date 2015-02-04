var express = require('express');
var app = express();
var mongojs = require("mongojs");
var server = require('http').Server(app);
var io = require('socket.io').listen(server);


var uri = "localhost",
    db = mongojs.connect(uri, ["quill"]);

server.listen(80);

app.use(express.static(process.cwd() + '/'));

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

function tellAboutOthers(socket)
{
    var data = [];
    
    var connected = findClientsSocket();
        
    for (var i in connected)
    {
        var client = connected[i];
        if (socket == client)
            continue;
        
        // append this client's info to the data
        data.push({name: client.name, color: client.color});
    }
    
    if (data.length > 0)
    {
        console.log(data);
        // send the data back to the original socket
        socket.emit("the_others", {others: data});
    }
}

function findClientsSocket(roomId, namespace) {
    var res = []
    , ns = io.of(namespace ||"/");    // the default namespace is "/"

    if (ns) {
        for (var id in ns.connected) {
            if(roomId) {
                var index = ns.connected[id].rooms.indexOf(roomId) ;
                if(index !== -1) {
                    res.push(ns.connected[id]);
                }
            } else {
                res.push(ns.connected[id]);
            }
        }
    }
    return res;
}

// handle incoming connections from clients
io.sockets.on('connection', function(socket)
{
    // generate name and color
    socket.name = "Guest"+parseInt(Math.random()*1000);
    socket.color = newColor();
    
    // signal all sockets of the new client
    io.sockets.emit("new_client", {name: socket.name, color: socket.color});
    
    // tell this new client about the others
    tellAboutOthers(socket);

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
    
    // when a message is received
    socket.on('msg_recv', function(data){
        // notify all clients
        io.sockets.emit("new_msg", {sender: socket.name, msg: data.msg});
    });
    
    // d/c
    socket.on('disconnect', function(){
        io.sockets.emit('drop_client', {'name' : socket.name});
    });
});
