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
    $("#cbox").append("<div class='"+c+"'><span class='uname' style='color: "+col+";'>"+username+"</span>"+message+"</div>");
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
    
        // append self to the users array (ids are local)
//        userInit(name, color);
}

function userInit(username, user_col)
{
    // this is called to add a user to the array with their
    // color and id saved
    users[username] = {color: user_col};
    
    // display a status message
    statusMsg("<b>"+username+"</b> has connected.");
}

function updateUser(oldname, newname)
{
    // move the data in the users array
    users[newname] = users[oldname];
    delete users[oldname];
    
    // display a status message
    statusMsg(""+oldname+" is now known as <b>"+newname+"</b>");
}

function update_name(data)
{
    // if the old name was us (or name isn't set), update our name onscreen
    if (data.oldname == name || name == "")
    {
        // set this client's name from the server
        name = data.name;
        $("#nameb").html(name);
    }
    
    if (data.oldname in users)
        updateUser(data.oldname, data.name);
    else
        userInit(data.name, data.color);
}

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

authorship = advancedEditor.getModule('authorship');

authorship.addAuthor('basic', 'rgba(255,153,51,0.4)');

cursorManager = advancedEditor.getModule('multi-cursor');

//cursorManager.setCursor('basic', 0, 'basic', 'rgba(255,153,51,0.9)');

advancedEditor.on('selection-change', function(range) {
  return console.info('advanced', 'selection', range);
});

//advancedEditor.on('text-change', function(delta, source) {
//  var sourceDelta, targetDelta;
//  if (source === 'api') {
//    return;
//  }
//  console.info('advanced', 'text', delta, source);
////  basicEditor.updateContents(delta);
//  sourceDelta = advancedEditor.getContents();
////  targetDelta = basicEditor.getContents();
//  return console.assert(_.isEqual(sourceDelta, targetDelta), "Editor diversion!", sourceDelta.ops, targetDelta.ops);
//});

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
