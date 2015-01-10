var advancedEditor, authorship, basicEditor, cursorManager, name, socket, _;

//name = "Guest" + parseInt(Math.random()*10000);
//    $("#nameb").html(name);

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
        socket.on("init_connect", connected);
        socket.on("name_change", update_name);
}

function connected(data)
{
        // client is connected successfully
        $("#statust").html("Connected!");
        $("#infopanel").show();
    
        // update name and color info
        update_name(data);
        color = data.color;
        $("#colorb").css("background-color", color);
}

function update_name(data)
{
    // set this client's name from the server
    name = data.name;
    $("#nameb").html(name);
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

initial_connect();
