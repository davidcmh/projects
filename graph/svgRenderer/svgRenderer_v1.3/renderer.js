var svg = require('simplesvg');
var data, nodes, links, browserPos;

// TODO: change dimension to width and height instead of x and y to make code clearer
var settings = {
    defaultDisplayDimension: {
        x: 800,
        y: 500
    }
}

renderInput("distributedData/0_1.json");

// get data from server
function renderInput(file) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {
            data = JSON.parse(xhr.responseText);

            browserPos = data.browserPos;
            nodes = data.nodes;
            links = data.links;

            var translate = {
                    x: -(browserPos.col * settings.defaultDisplayDimension.x),
                    y: -(browserPos.row * settings.defaultDisplayDimension.y)
                }
                ;


            // rendering
            // set up svgRoot
            var svgRoot = svg("svg");

            document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body

            svgRoot.attr("width", settings.defaultDisplayDimension.x)
                .attr("height", settings.defaultDisplayDimension.y);     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

            var graph = svgRoot.append("g")
                .attr("transform", "translate(" + translate.x + "," + translate.y + ")")
                .attr("class", "graph");


            //console.log("Time before rendering: " + window.performance.now());
            window.performance.mark("mark_before_append");

            // rendering

            // render edges
             links.forEach(function(link) {

             graph.append("line")
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


            window.performance.mark("mark_after_append");

            window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
            //     console.log("Time after rendering: " + window.performance.now());


            var mark_all = window.performance.getEntriesByType("mark");

            var measure_all = window.performance.getEntriesByType("measure");

//            console.log("All marks are: ");
            //          console.log(mark_all);
            //        console.log("All measures are: ");
            //      console.log(measure_all);

        }
    }

    xhr.open("GET", file, true);
    xhr.send();

}






