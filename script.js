var advancedEditor, authorship, basicEditor, cursorManager, name = "", socket, _, msgcount, users;

//name = "Guest" + parseInt(Math.random()*10000);
//    $("#nameb").html(name);

// initialize message counter
msgcount = 0;

// initialize local users
users = [];

function changename()
{
    // prompt for a new name
    var out = prompt("Enter your new name. This will appear above your cursor");
    
    // send the name if updated
    if (out!="" && out != null && out != name)
    {
        socket.emit("name_change", {name: out});
    }
}

function initial_connect()
{
        // try to connect
        $("#statust").html("Connecting...");
        socket = io.connect();
    
        // attach event listeners
        socket.on("new_client", new_client);
        socket.on("name_change", update_name);
        socket.on("new_msg", new_msg);
        socket.on("the_others", receive_others);
        socket.on("drop_client", drop_client);
        socket.on("disconnect", disconnect);
    
        // for positions and text
//        socket.on("recv_pos", recv_pos);
//        socket.on("recv_text", recv_text);
        socket.on("recv_delta", recv_delta);

}

function recv_delta(data)
{
    advancedEditor.updateContents(data);
}

function send_pos()
{
    socket.emit("send_pos", {pos: 0});
}

function disconnect()
{
        $("#statust").html("Disconnected");
        $("#infopanel").hide();
        $("#chat").hide();
    
        name = "";
}

function drop_client(data)
{
    statusMsg("<span class='uname' style='color: "+users[data.name].color+";'>"+data.name + "</span> has disconnected.");
    delete users[data.name];
}

function receive_others(data)
{
    var people = data["others"];
    for (var i in people)
    {
        var person = people[i];
        userInit(person.name, person.color);
    }
}

function new_msg(data)
{
    // this is called when a new chat message is received
    dispMsg(data.sender, data.msg);
}

function new_client(data)
{
    // if the new client is us
    if (name == "")
        connected(data);
    else
        update_name(data);
}

function statusMsg(message)
{
    // shortcut for status messages
    dispMsg("", message);
}

function dispMsg(username, message)
{
    // displays a message in the chat from the given username
    // if username is null, the message is displays as a server message
    
    // the class of the new message div
    var c = "msg";
    var col = "";
    
    // if msg count is even, background is different
    if (msgcount % 2 == 0)
        c += " a";
    
    // increase message count
    msgcount++;
            
    // if username is null, add the status class, otherwise
    // add the user's color rule from their ID
    if (username == "")
        c += " status";
    else
        col = users[username].color;
    
    // append the message to the actual textbox
    $("#cbox").append("<div class='"+c+"'><span class='uname' style='color: "+col+";'>"+username+"</span> "+message+"</div>");
    
    // scroll the chat window to the bottom
    $("#cbox").stop().animate({scrollTop:$("#cbox")[0].scrollHeight}, 1000);
}

function connected(data)
{
        // client is connected successfully
        $("#statust").html("Connected!");
        $("#infopanel").show();
        $("#chat").show();
    
        // display connected chat message
//        statusMsg("You have connected");
    
        // update name and color info
        update_name(data);
        color = data.color;
        $("#colorb").css("background-color", color);
    
        // create the cursor
        cursorManager.setCursor("advanced", 0, name, users[name].color);

    
        // append self to the users array (ids are local)
//        userInit(name, color);
}

function userInit(username, user_col)
{
    // this is called to add a user to the array with their
    // color and id saved
    users[username] = {color: user_col};
    
    // display a status message
    statusMsg("<span class='uname' style='color: "+users[username].color+";'>"+username+"</span> has connected.");
    
    // create an author for them
//    authorship.addAuthor(username, user_col);

}

function updateUser(oldname, newname)
{
    // move the data in the users array
    users[newname] = users[oldname];
    delete users[oldname];
    
    // display a status message
    statusMsg(""+oldname+" is now known as <span class='uname' style='color: "+users[newname].color+";'>"+newname+"</b>");
}

function update_name(data)
{
    
    if (data.oldname in users)
        updateUser(data.oldname, data.name);
    else
        userInit(data.name, data.color);
    
        // if the old name was us (or name isn't set), update our name onscreen
    if (data.oldname == name || name == "")
    {
        // set this client's name from the server
        name = data.name;
        $("#nameb").html(name);
    
        // update the cursor
        cursorManager.removeCursor("advanced");
        cursorManager.setCursor("advanced", 0, name, users[name].color);
    }
}

// on enter key pressed in chat
$(function() {
    $("#inputt").keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            // send message to server
            socket.emit("msg_recv", {msg: $("#inputt").val()});
            
            // clear the input box
            $("#inputt").val("");
            
            return false;
        } else {
            return true;
        }
    });
});

_ = Quill.require('lodash');

advancedEditor = new Quill('.advanced-wrapper .editor-container', {
  modules: {
    'authorship': {
      authorId: 'advanced',
      enabled: true
    },
    'toolbar': {
      container: '.advanced-wrapper .toolbar-container'
    },
    'link-tooltip': true,
    'image-tooltip': true,
    'multi-cursor': true
  },
  styles: false,
  theme: 'snow'
});

//authorship = advancedEditor.getModule('authorship');
//
//authorship.addAuthor('basic', 'rgba(255,153,51,0.4)');

cursorManager = advancedEditor.getModule('multi-cursor');

//cursorManager.setCursor('basic', 0, 'basic', 'rgba(255,153,51,0.9)');

advancedEditor.on('selection-change', function(range) {
  return console.info('advanced', 'selection', range);
});

advancedEditor.on('text-change', function(delta, source) {
  var sourceDelta, targetDelta;
  if (source === 'api') {
    return;
  }
//  basicEditor.updateContents(delta);
//  sourceDelta = advancedEditor.getContents();
    
  socket.emit("send_delta", delta);
    
//  targetDelta = basicEditor.getContents();
//  return console.assert(_.isEqual(sourceDelta, targetDelta), "Editor diversion!", sourceDelta.ops, targetDelta.ops);
});

function addCSSRule(sel, prop, val) {
    for(var i = 0; i < document.styleSheets.length; i++){
        var ss    = document.styleSheets[i];
        var rules = (ss.cssRules || ss.rules);
        var lsel  = sel.toLowerCase();

        for(var i2 = 0, len = rules.length; i2 < len; i2++){
            if(rules[i2].selectorText && (rules[i2].selectorText.toLowerCase() == lsel)){
                if(val != null){
                    rules[i2].style[prop] = val;
                    return;
                }
                else{
                    if(ss.deleteRule){
                        ss.deleteRule(i2);
                    }
                    else if(ss.removeRule){
                        ss.removeRule(i2);
                    }
                    else{
                        rules[i2].style.cssText = '';
                    }
                }
            }
        }
    }

    var ss = document.styleSheets[0] || {};
    if(ss.insertRule) {
        var rules = (ss.cssRules || ss.rules);
        ss.insertRule(sel + '{ ' + prop + ':' + val + '; }', rules.length);
    }
    else if(ss.addRule){
        ss.addRule(sel, prop + ':' + val + ';', 0);
    }
}

initial_connect();
