# Quill Websockets
Quill Websockets is an application that allows any number of users to compose a rich text document online with other people. This is accomplished using the [Quilljs Editor](http://quilljs.com) and is similar to Google Docs or Etherpad. A chat is provided to allow users to communicate while they edit their document.

## Preview
A live preview is available [here](http://octo.vgmoose.com:3002). Documents are not saved at all on the preview server.

## Running
```
git clone https://github.com/vgmoose/quill-ws.git
cd quill-ws
npm install
sudo node server.js
```
The default setting is to run on port 80, but this can be modified in ```server.js```. [MongoDB](http://mongodb.com) is required for database functionality. sudo is only required when running on privileged port numbers.

## Future Work
- Encryption:  Encrypting text with cloud editing software is complicated as only deltas representing the change between the document are sent over the socket and saved to the database. One workaround may be to use variable block length encryption to send chunks over the sockets that would still be unreadable to the server. A client-side JavaScript library would then perform the decryption for the users that are editing the document
- Export to ODT and DOCX: Unlike Google Docs, this would be preferable to be accomplished client-side, as to play nice with encryption. This feature would definitely be required though to make the software viable.
