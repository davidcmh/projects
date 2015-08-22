var svg = require('simplesvg');
var interactiveControl = require('svg-pan-zoom')
var data, nodes, links, rectDimension;

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
                height: document.body.clientHeight - 200
            }

            /*
             // overwrite containerDimension TODO: Delete later!
             containerDimension.width = 800;
             containerDimension.height = 500;
             */

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


            svgRoot.attr("width", "100%") //containerDimension.width
                .attr("height", "100%")     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"
                .attr("viewBox", "0 0 1280 800")    // this is accessed by pan; so needs to be defined at the start
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
                    .attr("stroke", "#B8B8B8 ");
            });


            // render nodes


            var nodesDom = graph.append("g")
                .attr("id", "nodes");


            // create g to group a highlighted DOM
            graph.append("g")
                .attr("id", "highlight");

            nodes.forEach(function (node) {

                nodesDom.append("circle")
                    .attr("r", 3)
                    .attr("cx", node.pos.x)
                    .attr("cy", node.pos.y)
                    .attr("fill", "teal")
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

renderInput("output.json");


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

highlight = function () {

    console.log("highlight is called");

    var highlightDom = document.getElementById("highlight");
    for (var i = 0; i < 10; ++i) {
        var node = nodes[i];
        highlightDom.append("circle")
            .attr("r", 3)
            .attr("cx", node.pos.x)
            .attr("cy", node.pos.y)
            .attr("fill", "red")
        ;
    }

}



