var svg = require('simplesvg');


// set up svgRoot
var svgRoot = svg("svg");

document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body


// set up container for graph
var width, height;
width = document.body.clientWidth;
height = document.body.clientHeight;


svgRoot.attr("width", width)
    .attr("height", height);     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

var graph = svgRoot.append("g")
    .attr("class", "graph")
    .attr("buffered-rendering", "static");


// set up data

// set up nodes
var numNodes = 100;
var nodesArr = [];

for (var i = 0; i < numNodes; i++) {
    nodesArr.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
}


// edge iterator to check for duplicates
var checkDuplicate = function(arr, edge) {
    var duplicate = false;                     // set an extra variable because we cannot break from forEach loop
    arr.forEach(function(d) {
        if (+d[0] == +edge[0] && +d[1] == +edge[1]) {
            duplicate = true;
            return;   // cannot break it but we can return it
        }
    });
    return duplicate;
};


// TODO: improve edges data structure, use an adjacency matrix maybe?
// set up edges
var numEdges = 500;
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
    while(checkDuplicate(edgesArr, edge));  // if there is duplicate, regenerate the edge

    edgesArr.push(edge);
}




console.log("Time before rendering: " + window.performance.now());
window.performance.mark("mark_before_append");
// rendering

// render edges
edgesArr.forEach(function(d) {
   graph.append("line")
       .attr("x1", nodesArr[d[0]][0])   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
       .attr("y1", nodesArr[d[0]][1])
       .attr("x2", nodesArr[d[1]][0])
       .attr("y2", nodesArr[d[1]][1])
       .attr("stroke-width", 1)
       .attr("stroke", "#B8B8B8 ");
});


// render nodes
nodesArr.forEach(function(d) {
    graph.append("circle")
        .attr("r", 5)
        .attr("cx", d[0])
        .attr("cy", d[1])
        .attr("fill", "teal")
    ;
});

window.performance.mark("mark_after_append");

window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
console.log("Time after rendering: " + window.performance.now());


var mark_all = window.performance.getEntriesByType("mark");

var measure_all = window.performance.getEntriesByType("measure");

console.log("All marks are: " );
console.log(mark_all);
console.log("All measures are: ");
console.log(measure_all);
