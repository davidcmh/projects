// now supports reading two input files
// TODO: refactor code

var svg = require('simplesvg');
var data, nodes, links, browserPos, graph;
var xdata, xnodes, xlinks;

var settings = {
    defaultDisplayDimension: {
        width: 400,
        height: 200
    }
}

renderInput("distributedData/0_0.json");

renderExtraInput("distributedData/0_1.json");

// get data from server
function renderInput(file) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {
            data = JSON.parse(xhr.responseText);

            browserPos = data.browserPos;
            nodes = data.nodes;
            links = data.links;

            renderMainGraph();
        }
    }

    xhr.open("GET", file, true);
    xhr.send();

}

function renderExtraInput(file) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {
            xdata = JSON.parse(xhr.responseText);

            // not required, since we using browserPos of original section
            // xbrowserPos = xdata.browserPos;
            xnodes = xdata.nodes;
            xlinks = xdata.links;

            renderExtraGraph();
        }
    }

    xhr.open("GET", file, true);
    xhr.send();

}


function renderExtraGraph() {
    // render edges

    var linksDom = document.getElementById("links");

    xlinks.forEach(function (link) {

        linksDom.append("line")
            .attr("x1", link.pos.from.x)   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
            .attr("y1", link.pos.from.y)
            .attr("x2", link.pos.to.x)
            .attr("y2", link.pos.to.y)
            .attr("stroke-width", 1)
            .attr("stroke", "#B8B8B8 ");
    });


    // render nodes

    xnodes.forEach(function (node) {
        console.log(node);

        graph.append("circle")
            .attr("r", 5)
            .attr("cx", node.pos.x)
            .attr("cy", node.pos.y)
            .attr("fill", "teal")
        ;

        graph.append("text")
            .attr("x", node.pos.x)
            .attr("y", node.pos.y)
            .text("(" + (node.pos.x).toFixed(0) + ", " + (node.pos.y).toFixed(0) + ")")
            .attr("font-size", 10);
        ;

    });
}


function renderMainGraph() {
    var translate = { // translate is negative, to make the whole canvas towards (0,0)
            x: -(browserPos.col * settings.defaultDisplayDimension.width),
            y: -(browserPos.row * settings.defaultDisplayDimension.height)
        }
        ;


    // rendering
    // set up svgRoot
    var svgRoot = svg("svg");

    document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body

    svgRoot.attr("width", settings.defaultDisplayDimension.width)//settings.defaultDisplayDimension.width
        .attr("height", settings.defaultDisplayDimension.height)
        .attr("viewBox", "0 0 400 200")
        .attr("id", "graph");     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

    graph = svgRoot.append("g")
        .attr("transform", "translate(" + translate.x + "," + translate.y + ")");


    //console.log("Time before rendering: " + window.performance.now());
    window.performance.mark("mark_before_append");

    // rendering

    var linkDom = graph.append("g")
        .attr("id", "links");

    // render edges
    links.forEach(function (link) {

        linkDom.append("line")
            .attr("x1", link.pos.from.x)   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
            .attr("y1", link.pos.from.y)
            .attr("x2", link.pos.to.x)
            .attr("y2", link.pos.to.y)
            .attr("stroke-width", 1)
            .attr("stroke", "#B8B8B8 ");
    });


    // render nodes

    nodes.forEach(function (node) {
        console.log(node);

        graph.append("circle")
            .attr("r", 5)
            .attr("cx", node.pos.x)
            .attr("cy", node.pos.y)
            .attr("fill", "teal")
        ;

        graph.append("text")
            .attr("x", node.pos.x)
            .attr("y", node.pos.y)
            .text("(" + (node.pos.x).toFixed(0) + ", " + (node.pos.y).toFixed(0) + ")")
            .attr("font-size", 10);
        ;

    });

    // Performance measures
    window.performance.mark("mark_after_append");
    window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
    //     console.log("Time after rendering: " + window.performance.now());
    var mark_all = window.performance.getEntriesByType("mark");
    var measure_all = window.performance.getEntriesByType("measure");
    // console.log("All marks are: ");
    // console.log(mark_all);
    // console.log("All measures are: ");
    // console.log(measure_all);
}

renderLinks = function () {
    var linksDom = document.getElementById("links");

    links.forEach(function (link) {

        linksDom.append("line")
            .attr("x1", link.pos.from.x)
            .attr("y1", link.pos.from.y)
            .attr("x2", link.pos.to.x)
            .attr("y2", link.pos.to.y)
            .attr("stroke-width", 1)
            .attr("stroke", "#B8B8B8");
    });
}




