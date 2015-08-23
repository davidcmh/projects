var svg = require('simplesvg');


/* Optimised split rendering
 1. Read individual partition (no need to scale, since it's already scaled in distributeGraph)
 2. translate by respective
 3. render (each browser now renders 4 partitions, 2 x 2)
 */


var containerDim = {
    width: 1400,
    height: 800
}


renderNodes("distributedData/nodesPos/0_0.bin");
renderNodes("distributedData/nodesPos/0_1.bin");
renderNodes("distributedData/nodesPos/1_0.bin");
renderNodes("distributedData/nodesPos/1_1.bin");


// set up svgRoot
var svgRoot = svg("svg");

document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body

svgRoot.attr("width", containerDim.width)//settings.defaultDisplayDimension.width
    .attr("height", containerDim.height)
    .attr("viewBox", "0 0 " + containerDim.width + " " + containerDim.height)
    .attr("id", "graph");     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"


// new optimised rendering, to read from binary pos files
function renderNodes(file) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, true);
    xhr.responseType = "arraybuffer";
    xhr.send();

    xhr.onreadystatechange = function () {
        var rawBuffer = xhr.response;

        if (rawBuffer)
            var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

        if (data) {    // data may not be ready the first time this function is called

            // partitionPos = [row, col]
            var partitionPos = [data[0], data[1]];

            // nodes = [[x, y, numLinks], [], ...]
            var nodes = [];

            for (var i = 2; i < data.length - 2; i += 3) {
                nodes.push([data[i], data[i + 1], data[i + 2]]);
            }

            /*
             console.log("partitionPos x: " + partitionPos[0]);
             console.log("partitionPos y: " + partitionPos[1]);
             console.log("nodes length: " + nodes.length);
             console.log("nodes data: ")
             console.log(nodes);

             */

            // rendering

            var translate = {
                x: partitionPos[1] * containerDim.width / 2,
                y: partitionPos[0] * containerDim.height / 2
            }

            translate.x = 0;
            translate.y = 0;

            graph = svgRoot.append("g")
                .attr("transform", "translate(" + translate.x + "," + translate.y + ")")
                .attr("id", partitionPos[0] + "_" + partitionPos[1]);


            // render nodes

            var r, g, b;  // r 50 g 100 b 0 (lime green); r 0 g 50 b 100 (nice blue); r 50, g 100, b 50 (pastel green)
            r = 0;  //
            g = 50;
            b = 20;   // range is 0 to 255


            var maxLinks = 5;
            var maxRGB = Math.max(r, g, b);
            console.log(maxRGB);
            var rgbIncrement = (255 - maxRGB) / maxLinks; //amount of increment remaining divide by no. of possible links (to know how much to increase for every increase in link)
            console.log(rgbIncrement);

            nodes.forEach(function (node) {

                var inc = Math.round(rgbIncrement * node[2]);

                graph.append("circle")
                    .attr("r", 3)
                    .attr("cx", node[0])
                    .attr("cy", node[1])
                    .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")") //2B5D85(darker) C4FFF6 BCF5EC  A9DED9
                ;
                /*
                 graph.append("text")
                 .attr("x", node.pos.x)
                 .attr("y", node.pos.y)
                 .text("(" + (node.pos.x).toFixed(0) + ", " + (node.pos.y).toFixed(0) + ")")
                 .attr("font-size", 10);
                 ;
                 */
            });
        }
    }

}


/*



 //renderInput("distributedData/0_0.json");

 //renderExtraInput("distributedData/0_1.json");

 var data, nodes, links, browserPos, graph;
var xdata, xnodes, xlinks;

var settings = {
    defaultDisplayDimension: {
        width: 400,
        height: 200
    }
}


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


 */

