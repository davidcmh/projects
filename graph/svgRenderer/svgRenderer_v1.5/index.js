var svg = require('simplesvg');


var nodes, links, graph, containerDimension, scales, scaleDown;  // defined globally so they can be accessed by other functions
var nodesDom, linksDom;

renderNodes("nodesPos.bin");
getLinksAndRender("linksPos.bin");

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

            // rectDimension = [width, height]
            var rectDimension = [data[0], data[1]];

            // nodes = [[x, y, numLinks], [], ...]
            nodes = [];

            for (var i = 2; i < data.length - 2; i += 3) {
                nodes.push([data[i], data[i + 1], data[i + 2]]);
            }


            // transform data: instead of transforming SVG elements, transform coordinates instead
            // also set up container for graph
            containerDimension = {
                width: document.body.clientWidth,
                height: document.body.clientHeight - 100
            }


            scales = {
                x: containerDimension.width / rectDimension[0],
                y: containerDimension.height / rectDimension[1]
            };


            // scaleDown  makes the overall graph smaller and nearer to (0, 0)
            scaleDown = 0.9;

            nodes.forEach(function (node) {

                node[0] *= scales.x * scaleDown;
                node[1] *= scales.y * scaleDown;

                node[0] += containerDimension.width * (1 - scaleDown) / 2;    // add padding to x & y to centralise graph
                node[1] += containerDimension.height * (1 - scaleDown) / 2;
            });


            // rendering
            // set up svgRoot
            var svgRoot = svg("svg");

            document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body


            svgRoot.attr("width", containerDimension.width) //containerDimension.width
                .attr("height", containerDimension.height)     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"
                .attr("viewBox", "0 0 " + containerDimension.width + " " + containerDimension.height)    // this is accessed by pan; so needs to be defined at the start
                .attr("id", "graph");

            graph = svgRoot.append("g");


            console.log("Time before rendering: " + window.performance.now());
            window.performance.mark("mark_before_append");

            // rendering

            // render nodes


            linksDom = graph.append("g")
                .attr("id", "links");

            nodesDom = graph.append("g")
                .attr("id", "nodes");


            // create g to group a highlighted DOM
            graph.append("g")
                .attr("id", "highlight");

            graph.append("g")
                .attr("id", "labels");


            var r, g, b;  // r 50 g 100 b 0 (lime green); r 0 g 50 b 100 (nice blue); r 50, g 100, b 50 (pastel green)
            r = 0;  //
            g = 50;
            b = 20;   // range is 0 to 255


            var maxLinks = nodes.length / 10;
            var maxRGB = Math.max(r, g, b);
            console.log(maxRGB);
            var rgbIncrement = (255 - maxRGB) / maxLinks; //amount of increment remaining divide by no. of possible links (to know how much to increase for every increase in link)
            console.log(rgbIncrement);

            nodes.forEach(function (node) {

                var inc = Math.round(rgbIncrement * node[2]);

                nodesDom.append("circle")
                    .attr("r", 3)
                    .attr("cx", node[0])
                    .attr("cy", node[1])
                    .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")") //2B5D85(darker) C4FFF6 BCF5EC  A9DED9
                ;

            });
        }
    }

}

function getLinksAndRender(file) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", file, true);
    xhr.responseType = "arraybuffer";
    xhr.send();

    xhr.onreadystatechange = function () {
        var rawBuffer = xhr.response;

        if (rawBuffer)
            var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

        if (data) {    // data may not be ready the first time this function is called

            // links = [[x1, y1, x2, y2], [], ...]
            links = [];

            // read links data and add each link onto array
            for (var i = 0; i < data.length - 3; i += 4) {
                links.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
            }

            // scale each link based on browser dimension
            links.forEach(function (link) {

                link[0] *= scales.x * scaleDown;
                link[1] *= scales.y * scaleDown;
                link[2] *= scales.x * scaleDown;
                link[3] *= scales.y * scaleDown;

                link[0] += containerDimension.width * (1 - scaleDown) / 2;
                link[1] += containerDimension.height * (1 - scaleDown) / 2;
                link[2] += containerDimension.width * (1 - scaleDown) / 2;
                link[3] += containerDimension.height * (1 - scaleDown) / 2;
            });

            // render edges
            renderLinks();
        }

    };
}

renderLinks = function () {

    links.forEach(function (link) {

        linksDom.append("line")
            .attr("x1", link[0])
            .attr("y1", link[1])
            .attr("x2", link[2])
            .attr("y2", link[3])
            .attr("stroke-width", 1)
            .attr("stroke", "#333"); //B8B8B8
    });

}


renderLabels = function () {
    var labelsDom = document.getElementById("labels");

    nodes.forEach(function (node) {

        labelsDom.append("text")
            .attr("x", node[0] + 2)
            .attr("y", node[1] - 2)
            .text("(" + (node[0]).toFixed(0) + ", " + (node[1]).toFixed(0) + ")")
            .attr("font-size", 10)
            .attr("fill", "white");
    });
}


highlight = function () {

    console.log("highlight is called");

    var highlightDom = document.getElementById("highlight");
    for (var i = 0; i < 10; ++i) {
        var node = nodes[i];
        highlightDom.append("circle")
            .attr("r", 3)
            .attr("cx", node[0])
            .attr("cy", node[1])
            .attr("fill", "#CF2331")
        ;
    }

}

/*

var data, nodes, links, rectDimension;


 renderInput("output.json");


// get data from server
function renderInput(file) {
    console.log("Time when renderInput() is called: " + window.performance.now());

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {
            data = JSON.parse(xhr.responseText);

            nodes = data.nodes;
            links = data.links;
            rectDimension = data.rectDimension;


            // transform data: instead of transforming SVG elements, transform coordinates instead
            // also set up container for graph
            var containerDimension = {
                width: document.body.clientWidth,
                height: document.body.clientHeight - 100
            }


            var scales = {
                x: containerDimension.width / rectDimension.width,
                y: containerDimension.height / rectDimension.height
            };


            // scaleDown  makes the overall graph smaller and nearer to (0, 0)
            var scaleDown = 0.9;

            nodes.forEach(function (node) {

                node.pos.x *= scales.x * scaleDown;
                node.pos.y *= scales.y * scaleDown;

                node.pos.x += containerDimension.width * (1 - scaleDown) / 2;    // add padding to x & y to centralise graph
                node.pos.y += containerDimension.height * (1 - scaleDown) / 2;
            });

            links.forEach(function (link) {

                link.pos.from.x *= scales.x * scaleDown;
                link.pos.from.y *= scales.y * scaleDown;
                link.pos.to.x *= scales.x * scaleDown;
                link.pos.to.y *= scales.y * scaleDown;

                link.pos.from.x += containerDimension.width * (1 - scaleDown) / 2;
                link.pos.from.y += containerDimension.height * (1 - scaleDown) / 2;
                link.pos.to.x += containerDimension.width * (1 - scaleDown) / 2;
                link.pos.to.y += containerDimension.height * (1 - scaleDown) / 2;
            });


            // rendering
            // set up svgRoot
            var svgRoot = svg("svg");

            document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body


            svgRoot.attr("width", containerDimension.width) //containerDimension.width
                .attr("height", containerDimension.height)     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"
                .attr("viewBox", "0 0 " + containerDimension.width + " " + containerDimension.height)    // this is accessed by pan; so needs to be defined at the start
                .attr("id", "graph");

            var graph = svgRoot.append("g");


            console.log("Time before rendering: " + window.performance.now());
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
                    .attr("stroke", "#333"); //B8B8B8
            });


            // render nodes


            var nodesDom = graph.append("g")
                .attr("id", "nodes");


            // create g to group a highlighted DOM
            graph.append("g")
                .attr("id", "highlight");

            graph.append("g")
                .attr("id", "labels");


            var r, g, b;  // r 50 g 100 b 0 (lime green); r 0 g 50 b 100 (nice blue); r 50, g 100, b 50 (pastel green)
            r = 0;  //
            g = 50;
            b = 20;   // range is 0 to 255


            var maxLinks = nodes.length / 10;
            var maxRGB = Math.max(r, g, b);
            console.log(maxRGB);
            var rgbIncrement = (255 - maxRGB) / maxLinks; //amount of increment remaining divide by no. of possible links (to know how much to increase for every increase in link)
            console.log(rgbIncrement);

            nodes.forEach(function (node) {

                var inc = Math.round(rgbIncrement * node.adj);

                nodesDom.append("circle")
                    .attr("r", 3)
                    .attr("cx", node.pos.x)
                    .attr("cy", node.pos.y)
                    .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")") //2B5D85(darker) C4FFF6 BCF5EC  A9DED9
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

        }

    }

    xhr.open("GET", file, true);
    xhr.send();

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
            .attr("stroke", "#333");
    });
}

renderLabels = function () {
    var labelsDom = document.getElementById("labels");

    nodes.forEach(function (node) {

        labelsDom.append("text")
            .attr("x", node.pos.x + 2)
            .attr("y", node.pos.y - 2)
            .text("(" + (node.pos.x).toFixed(0) + ", " + (node.pos.y).toFixed(0) + ")")
            .attr("font-size", 10)
            .attr("fill", "white");
    });
}


highlight = function () {

    console.log("highlight is called");

    var highlightDom = document.getElementById("highlight");
    for (var i = 0; i < 10; ++i) {
        var node = nodes[i];
        highlightDom.append("circle")
            .attr("r", 3)
            .attr("cx", node.pos.x)
            .attr("cy", node.pos.y)
            .attr("fill", "#CF2331")
        ;
    }

}


 */