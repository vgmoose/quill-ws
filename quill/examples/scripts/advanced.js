var advancedEditor, authorship, basicEditor, cursorManager, name, socket, _;

//name = "Guest" + parseInt(Math.random()*10000);
//    $("#nameb").html(name);

function changename()
{
    name = prompt("Enter your new name. This will appear above your cursor");
    $("#nameb").html(name);
}

function initial_connect()
{
        $("#statust").html("Connecting...");
        socket = io.connect();
    socket.on("init_connect", connected);
}

function connected(data)
{
     $("#statust").html("Connected!");
        name = data.name;
        color = data.color;
    console.log("You are " + name + " with color " + color);
        $("#infopanel").show();

        $("#nameb").html(name);
        $("#colorb").css("background-color", color);
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
