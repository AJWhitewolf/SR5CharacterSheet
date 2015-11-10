/**
 * Created by adunigan on 10/30/2015.
 */
//Import the HTTP module
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var xmldom = require('xmldom');

const ROOT='../';
//var qs = require('qs');

//Set listener port
const PORT=9555;

//Handle requests
function requestHandler(request, response){
    try {
        //log the request on console
        console.log(request.url);
        //Disptach
        //dispatcher.dispatch(request, response);
        //serveFile('..'+pathname, response);
        processRequest(request, response);
    } catch(err) {
        console.log(err);
    }
}

function serveMain(req, res) {
    fs.readFile('../index.html', function(err, html) {
        if(err) {
            throw err;
        } else {
            res.writeHeader(200, {'Content-Type': 'text/html'});
            res.end(html);
        }
    });
}

function serveFile(fileReq, res) {
    fs.readFile(fileReq, function(err, html) {
        if(err) {
            res.writeHeader(404, {'Content-Type': 'text/html'});
            res.end();
        } else {
            switch(path.extname(fileReq)) {
                case '.js':
                    res.writeHeader(200, {'Content-Type': 'text/javascript'});
                    res.end(html);
                    break;
                case '.css':
                    res.writeHeader(200, {'Content-Type': 'text/css'});
                    res.end(html);
                    break;
                case '.xml':
                case '.xsl':
                    res.writeHeader(200, {'Content-Type': 'text/xml'});
                    res.end(html);
                    break;
                case '.png':
                    if(path.basename(fileReq) == 'Cortex-Wallpaper.png') {
                        console.log("Wallpaper requested, sending Max-Age...");
                        res.writeHeader(200, {'Max-Age': '31536000'})
                    }
                    res.writeHeader(200, {'Content-Type': 'image/png'});
                    res.end(html);
                    break;
                case '.ico':
                    res.writeHeader(200, {'Content-Type': 'image/x-icon'});
                    res.end(html);
                    break;
                default:
                    res.writeHeader(200, {'Content-Type': 'text/html'});
                    res.end(html);
                    break;
            }
        }
    });
}

function getNodeByPos(doc, pos){
    var docRoot = doc.getElementsByTagName("character")[0];
    var path = pos.split('.');
    var cNode = docRoot;
    for(var i=0;i<path.length;i++){
        if(isNaN(path[i])) {
            pnodes = cNode.childNodes;
            for(var k=0;k<pnodes.length;k++){
                if(pnodes[k].tagName == path[i]){
                    cNode = pnodes[k];
                }
            }
        } else {
            cNode = cNode.childNodes[path[i]-1];
        }
    }
    return cNode;
}

function processRequest(req, res) {
    var url_parts = url.parse(req.url, true);
    switch(req.url.split('?')[0]) {
        case '/':
            serveMain(req, res);
            break;

        case '/new':
            var charName = url_parts.query.charName;
            var filename = "../xml/characters/" + charName.split(" ").join("") + ".xml";

            //Add loading pc_template.xml and filling in charname
            fs.readFile('../xml/templates/pc_template.xml', 'ascii', function(err, data) {
                if(err) {
                    console.log("Could not open file, "+err);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('{"response": "failure"}');
                }
                var xdocParser = new xmldom.DOMParser();
                var xdoc = xdocParser.parseFromString(data);

                var cNode = getNodeByPos(xdoc, "basic_info.name");
                cNode.textContent = charName;
                fs.exists(filename, function(exists){
                    if(exists){
                        console.log("Unable to write new character file, character name already exists.");
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "failure"}');
                    } else {
                        var serializer = new xmldom.XMLSerializer();
                        fs.writeFile(filename, serializer.serializeToString(xdoc), function(err){
                            if(err){
                                console.log(err);
                                res.writeHead(200, {'Content-Type': 'text/plain'});
                                res.end('{"response": "failure"}');
                            } else {
                                res.writeHead(200, {'Content-Type': 'text/plain'});
                                res.end('{"response": "success"}');
                            }
                        });
                    }
                });
            });
            break;

        case '/update':
            var payload = url_parts.query.payload;
            var json = JSON.parse(payload);
            var char = json['update']['character'];
            var node = json['update']['node'];
            var newValue = json['update']['newValue'];

            fs.readFile('../xml/characters/'+char.split(" ").join("")+'.xml', 'ascii', function(err, data) {
                if(err) {
                    console.log("Could not open file, "+err);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('{"response": "failure"}');
                }
                var xdocParser = new xmldom.DOMParser();
                var xdoc = xdocParser.parseFromString(data);

                var cNode = getNodeByPos(xdoc, node);

                cNode.textContent = newValue;
                var serializer = new xmldom.XMLSerializer();
                console.log(cNode.toString());
                //console.log(serializer.serializeToString(xdoc.getElementsByTagName("attributes")[0]));
                fs.writeFile('../xml/characters/'+char.split(" ").join("")+'.xml', serializer.serializeToString(xdoc), function(err) {
                    if(err) {
                        console.log("Error while writing file: "+err);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "failure"}');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "success"}');
                    }
                });
            });
            break;

        case '/removeNode':
            var payload = url_parts.query.payload;
            var json = JSON.parse(payload);
            var char = json['remove']['character'];
            var position = json['remove']['position'];

            fs.readFile('../xml/characters/'+char.split(" ").join("")+'.xml', 'ascii', function(err, data) {
                if(err) {
                    console.log("Could not open file, "+err);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('{"response": "failure"}');
                }
                var xdocParser = new xmldom.DOMParser();
                var xdoc = xdocParser.parseFromString(data);

                var cNode = getNodeByPos(xdoc, position);

                cNode.parentNode.removeChild(cNode);

                var serializer = new xmldom.XMLSerializer();
                console.log(serializer.serializeToString(cNode));

                fs.writeFile('../xml/characters/'+char.split(" ").join("")+'.xml', serializer.serializeToString(xdoc), function(err) {
                    if(err) {
                        console.log("Error while writing file: "+err);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "failure"}');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "success"}');
                    }
                });
            });
            break;

        case '/addNode':
            var payload = url_parts.query.payload;
            var json = JSON.parse(payload);
            var char = json['update']['character'];
            var node = json['update']['node'];
            var position = json['update']['position'];

            fs.readFile('../xml/characters/'+char.split(" ").join("")+'.xml', 'ascii', function(err, data) {
                if(err) {
                    console.log("Could not open file, "+err);
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('{"response": "failure"}');
                }
                var xdocParser = new xmldom.DOMParser();
                var xdoc = xdocParser.parseFromString(data);

                var cNode = getNodeByPos(xdoc, position);

                var newNode = xdocParser.parseFromString(node);
                cNode.appendChild(newNode);

                var serializer = new xmldom.XMLSerializer();
                //console.log(serializer.serializeToString(cNode));

                fs.writeFile('../xml/characters/'+char.split(" ").join("")+'.xml', serializer.serializeToString(xdoc), function(err) {
                    if(err) {
                        console.log("Error while writing file: "+err);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "failure"}');
                    } else {
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('{"response": "success"}');
                    }
                });
            });
            break;

        case '/fetchCharacters':
            var clist = {
                cList: []
            };
            fs.readdir('../xml/characters/', function(err, items){
                for(var i=0;i<items.length;i++){
                    var fCheck = items[i].split(".");
                    if(fCheck[1] == 'xml') {
                        clist.cList.push(items[i].split(".")[0]);
                    }
                }
                res.writeHead(200, {'Content-Type': 'text/plain'});
                res.end(JSON.stringify(clist));
            });
            break;

        default:
            serveFile('..'+req.url, res);
            break;
    }
}

//Create the server
var server = http.createServer(requestHandler);

//Start the server
server.listen(PORT, function() {
   console.log("Server listening on port %s", PORT);
});