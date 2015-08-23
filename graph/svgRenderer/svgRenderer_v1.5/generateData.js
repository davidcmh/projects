var startTime = new Date();
console.log("start: " + startTime.getTime());

var createGraph = require('ngraph.graph');
var g = createGraph();

// set up nodes
var numNodes = 5;

/* handled by ngraph.graph automatically when adding links
 var nodesArr = [];

 for (var i = 0; i < numNodes; i++) {
 nodesArr.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
 }
 */

// edge iterator to check for duplicates
var checkDuplicate = function (arr, edge) {
    var duplicate = false;                     // set an extra variable because we cannot break from forEach loop
    arr.forEach(function (d) {
        if (+d[0] == +edge[0] && +d[1] == +edge[1]) {
            duplicate = true;
            return;   // cannot break it but we can return it
        }
    });
    return duplicate;
};

console.log("before generating edges: " + (new Date).getTime());

// TODO: improve edges data structure, use an adjacency matrix maybe?
// set up edges
var numEdges = 8;
var edgesArr = [];

for (var i = 0; i < numEdges; i++) {

    var edge;

    do {
        var node1 = Math.floor(Math.random() * numNodes);
        var node2 = Math.floor(Math.random() * numNodes);

        while (node2 == node1) {
            node2 = Math.floor(Math.random() * numNodes);
        }

        if (node1 > node2) {   // make node1 the smaller node, to simplify check later on
            var temp = node1;
            node1 = node2;
            node2 = temp;
        }

        edge = [node1, node2];

    }
    while (checkDuplicate(edgesArr, edge));  // if there is duplicate, regenerate the edge

    edgesArr.push(edge);
}

console.log("after generating edges: " + (new Date).getTime());

// set up graph
// add links to ngraph.graph data structure

for (var i = 0; i < numNodes; i++) {
    g.addNode(i);
}


edgesArr.forEach(function (e) {
    g.addLink(e[0], e[1]);    // each link object has attributes data, fromId and toId
});

/* output links and nodes
 g.forEachNode(function(node) {
 console.log(node);
 });

 g.forEachLink(function(link) {
 console.log(link);
 });

 */


// force directed layout
var ITERATIONS_COUNT = 1000;

// Configure
var physicsSettings = {
    springLength: 100,
    springCoeff: 0.0008,
    gravity: 10,    // 0.1 not much difference from 0; 10/50/100 shows good dispersion; -12 makes it a hairball;
    theta: 0.5,
    dragCoeff: 0.02,
    timeStep: 20
};

console.log("before layout computation: " + (new Date).getTime());
var layout = require('ngraph.forcelayout')(g, physicsSettings);
for (var i = 0; i < ITERATIONS_COUNT; ++i) {
    layout.step();
}
console.log("after layout computation: " + (new Date).getTime());

var rect = layout.getGraphRect();   // get dimensions of bounding rect
var rectDimension = {
    width: rect.x2 - rect.x1,
    height: rect.y2 - rect.y1
};

var nodesArr = [];
var linksArr = [];
var nodesData = [];


g.forEachNode(function (node) {
    var nodePos = layout.getNodePosition(node.id);
    nodePos.x += -rect.x1;    // align top left corner of force-generated graph to (0,0)
    nodePos.y += -rect.y1;      // changing position of nodes auto changes the position of links attached to them
// previously applied changes to links also, which is why the graph wasn't rendered properly, spent almost 45mins debugging that..

    var linkedNodesArr = [];


    function addLinkedNodes() {
        var linksArr = node.links;
        linksArr.forEach(function (link) {
            if (link.fromId == node.id) {
                linkedNodesArr.push(link.toId);
            } else {
                linkedNodesArr.push(link.fromId);
            }
        })
    }

    addLinkedNodes();

    nodesArr.push(
        {
            id: node.id,
            pos: nodePos,
            adj: node.links.length,    // to get length of connected nodes (adjacent nodes)
            links: node.links,
            linkedNodes: linkedNodesArr
        }
    )


    nodesData.push(
        {
            id: node.id,  // might be unnecessary (actually good to have it, so that if need to check through json data, could immediately identify which node it is, instead of counting from the start)
            pos: nodePos,
            adj: linkedNodesArr
        }
    )

});

console.log("after adding nodes to graph: " + (new Date).getTime());

g.forEachLink(function (link) {

    linksArr.push(
        {
            data: link.data,
            fromId: link.fromId,
            toId: link.toId,
            pos: layout.getLinkPosition(link.id)
        }
    );
});

console.log("after adding links to graph: " + (new Date).getTime());

var data = {
    rectDimension: rectDimension,
    nodes: nodesArr,
    links: linksArr
}


// TODO: check whether to implement writeFileSync or simply writeFile
var fs = require('fs');
console.log("before writing file: " + (new Date).getTime());
fs.writeFileSync("output.json", JSON.stringify(data));
console.log("after writing file: " + (new Date).getTime());


var endTime = new Date();
console.log("end: " + endTime.getTime());
console.log("total time elapsed: " + (endTime - startTime));


// output nodes data to nodes.json
fs.writeFileSync("nodes.json", JSON.stringify(nodesData));


// experiments with write/read buffer

var arr = [1989.29, 1892.5, 910, 2899];

var buf = new Buffer(16);
var offset = 0;
arr.forEach(function (value) {
    buf.writeFloatLE(value, offset);
    offset += 4
});

console.log(buf);

// readFloatLE works by taking offset as input

console.log(buf.readFloatLE(8));


// process link positions into buffer and output into binary file [DONE! :D]
/*
 1. get links count
 2. create byte buffer (each link needs 4 + 4 + 4 + 4 bytes, for x1, y1, x2, y2)
 3. write to file
 */

console.log("Starting to output into linksPos.bin");

var linksCount = g.getLinksCount();
var linksBuf = new Buffer(linksCount * 16);
var offset = 0;   // offset for buffer

g.forEachLink(function (link) {

    var pos = layout.getLinkPosition(link.id);

    linksBuf.writeFloatLE(pos.from.x, offset);
    linksBuf.writeFloatLE(pos.from.y, offset + 4);
    linksBuf.writeFloatLE(pos.to.x, offset + 8);
    linksBuf.writeFloatLE(pos.to.y, offset + 12);

    offset += 16;

});


fs.writeFileSync("linksPos.bin", linksBuf);

// check if output is correct
for (var i = 0; i < linksCount; ++i) {
    var readOffset = i * 16;
    console.log(linksBuf.readFloatLE(readOffset));
    console.log(linksBuf.readFloatLE(readOffset + 4));
    console.log(linksBuf.readFloatLE(readOffset + 8));
    console.log(linksBuf.readFloatLE(readOffset + 12));
}


// process node positions into buffer and output into binary file

console.log("Starting to output into nodesPos.bin");

// 1. set up buffer and offset
var nodesCount = g.getNodesCount();
var nodesBuf = new Buffer(nodesCount * 12 + 8);   // 4 + 4 + 4 bytes for x, y position & no. of connected nodes; 8 extra bytes to record rect dimension
var offset = 0;   // offset for buffer


// 2. add data to buffer; rectDimension, followed each node's positions
nodesBuf.writeFloatLE(rectDimension.width, offset);
nodesBuf.writeFloatLE(rectDimension.height, offset + 4);
offset += 8;

g.forEachNode(function (node) {

    var pos = layout.getNodePosition(node.id);

    nodesBuf.writeFloatLE(pos.x, offset);
    nodesBuf.writeFloatLE(pos.y, offset + 4);
    nodesBuf.writeFloatLE(node.links.length, offset + 8);

    offset += 12;
});

// 3. write into file
fs.writeFileSync("nodesPos.bin", nodesBuf);


// check if output is correct (first rectDimension, then each node's position & no. of connected nodes)

console.log(nodesBuf.readFloatLE(0));
console.log(nodesBuf.readFloatLE(4));

for (var i = 0; i < nodesCount; ++i) {
    var readOffset = i * 12 + 8;
    console.log(nodesBuf.readFloatLE(readOffset));
    console.log(nodesBuf.readFloatLE(readOffset + 4));
    console.log(nodesBuf.readFloatLE(readOffset + 8));
}


/* on how to read bin files

 https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data

 $http.get('data/positions.bin', {
 responseType: 'arraybuffer'
 })
 .then(convertToPositions)
 .then(addNodesToGraph)
 .then(downloadLinks)
 .catch (reportError);


 */