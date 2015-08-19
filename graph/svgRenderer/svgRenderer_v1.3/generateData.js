var startTime = new Date();
console.log("start: " + startTime.getTime());

var createGraph = require('ngraph.graph');
var g = createGraph();

// set up nodes
var numNodes = 2;

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
var numEdges = 1;
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

g.forEachNode(function (node) {
    var nodePos = layout.getNodePosition(node.id);
    nodePos.x += -rect.x1;    // align top left corner of force-generated graph to (0,0)
    nodePos.y += -rect.y1;      // changing position of nodes auto changes the position of links attached to them
// previously applied changes to links also, which is why the graph wasn't rendered properly, spent almost 45mins debugging that..
    nodesArr.push(
        {
            data: node.data,
            id: node.id,
            pos: nodePos
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

//console.log(data.nodes.length);

// TODO: check whether to implement writeFileSync or simply writeFile
var fs = require('fs');
console.log("before writing file: " + (new Date).getTime());
fs.writeFileSync("output.json", JSON.stringify(data));
console.log("after writing file: " + (new Date).getTime());


var endTime = new Date();
console.log("end: " + endTime.getTime());
console.log("total time elapsed: " + (endTime - startTime));