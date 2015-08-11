var createGraph = require('ngraph.graph');
var g = createGraph();
var svg = require('simplesvg');


// get data from server
function readFile(file) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {

        if (xhr.readyState==4 && xhr.status==200) {
            console.log(xhr.responseText);

        }

    }

    xhr.open("GET", file, true);
    xhr.send();

}

readFile("output.json");

/*
// rendering
// set up svgRoot
var svgRoot = svg("svg");

document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body


// set up container for graph

var containerDimension = {
    width: document.body.clientWidth,
    height: document.body.clientHeight
}

var translate = { // -rect.x1 instead of Math.abs(rect.x1) because of the case where rect is fully inside container
    x: -rect.x1 + (containerDimension.width / 2 - (rect.x2 - rect.x1) / 2),// first translate by smallest x, then translate by difference between centre of container and centre of rect
    y: -rect.y1 + (containerDimension.height / 2 - (rect.y2 - rect.y1) / 2)
};



var scale = {
    x: (containerDimension.width / (rect.x2 - rect.x1)),
    y: (containerDimension.height / (rect.y2 - rect.y1))
};


console.log("containerDimension");
console.log(containerDimension);
console.log("rectDimension");
console.log(rect);
console.log("translate");
console.log(translate);
console.log("scale")
console.log(scale);

/* actually all the formulaes are the same, no need to split into cases
 if (rect.x1 < 0 && rect.x2 < 0) {  // and assuming x1 is always < x2
 translate.x = -(rect.x1) + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
 } else if (rect.x1 < 0 && rect.x2 >= 0) {
 translate.x = -(rect.x1) + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
 } else {  // both are >= 0
 translate.x = -rect.x1 + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
 }
 */
/*

svgRoot.attr("width", containerDimension.width)
    .attr("height", containerDimension.height);     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

var graph = svgRoot.append("g")
    .attr("transform", "matrix(" + 0.5 + "," + 0 + ","  + 0 + "," + 0.5 + "," + translate.x + "," + translate.y + ")")   // scaling affects transformation
    .attr("class", "graph")
    .attr("buffered-rendering", "static");


console.log("Time before rendering: " + window.performance.now());
window.performance.mark("mark_before_append");
// rendering

// render edges
g.forEachLink(function (link) {
    var pos = layout.getLinkPosition(link.id);
    graph.append("line")
        .attr("x1", pos.from.x)   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
        .attr("y1", pos.from.y)
        .attr("x2", pos.to.x)
        .attr("y2", pos.to.y)
        .attr("stroke-width", 1)
        .attr("stroke", "#B8B8B8 ");
});


// render nodes

g.forEachNode(function (node) {
    var pos = layout.getNodePosition(node.id);
    graph.append("circle")
        .attr("r", 5)
        .attr("cx", pos.x)
        .attr("cy", pos.y)
        .attr("fill", "teal")
    ;

    graph.append("text")
        .attr("x", pos.x)
        .attr("y", pos.y)
        .text("(" + (pos.x).toFixed(0) + ", " + (pos.y).toFixed(0) + ")")
        .attr("font-size", 10);
    ;

});





window.performance.mark("mark_after_append");

window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
console.log("Time after rendering: " + window.performance.now());


var mark_all = window.performance.getEntriesByType("mark");

var measure_all = window.performance.getEntriesByType("measure");

console.log("All marks are: ");
console.log(mark_all);
console.log("All measures are: ");
console.log(measure_all);

*/