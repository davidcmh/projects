var svg = require('simplesvg');
var data, nodes, links, rect;

// get data from server
function renderInput(file) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {
            data = JSON.parse(xhr.responseText);

            nodes = data.nodes;
            links = data.links;
            rect = data.rectDimension;


            // transform data: instead of transforming SVG elements, transform coordinates instead
            // also set up container for graph
            var containerDimension = {
                width: document.body.clientWidth,
                height: document.body.clientHeight
            }

            var scales = {
                x: (containerDimension.width / (rect.x2 - rect.x1)),
                y: (containerDimension.height / (rect.y2 - rect.y1))
            };


            // scaleDown  makes the overall graph smaller and nearer to (0, 0)
            var scaleDown = 0.9;

            nodes.forEach(function (node) {
                node.pos.x += -rect.x1;    // align top left corner of force-generated graph to (0,0)
                node.pos.y += -rect.y1;

                node.pos.x *= scales.x * scaleDown;
                node.pos.y *= scales.y * scaleDown;

                node.pos.x += containerDimension.width * (1 - scaleDown) / 2;    // add padding to x & y to centralise graph
                node.pos.y += containerDimension.height * (1 - scaleDown) / 2;
            });

            links.forEach(function (link) {


                link.pos.from.x += -rect.x1;
                link.pos.from.y += -rect.y1;
                link.pos.to.x += -rect.x1;
                link.pos.to.y += -rect.y1;

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


            var translate = { // -rect.x1 instead of Math.abs(rect.x1) because of the case where rect is fully inside container
                x: -rect.x1 + (containerDimension.width / 2 - (rect.x2 - rect.x1) / 2),// first translate by smallest x, then translate by difference between centre of container and centre of rect
                y: -rect.y1 + (containerDimension.height / 2 - (rect.y2 - rect.y1) / 2)
            };


            if (scales.x < 1 || scales.y < 1) {
                scales.x = scales.y = Math.min(scales.x, scales.y);
            }

            /* actually all the formulaes are the same, no need to split into cases
             if (rect.x1 < 0 && rect.x2 < 0) {  // and assuming x1 is always < x2
             translate.x = -(rect.x1) + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
             } else if (rect.x1 < 0 && rect.x2 >= 0) {
             translate.x = -(rect.x1) + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
             } else {  // both are >= 0
             translate.x = -rect.x1 + (containerDimension.width/2 - (rect.x2 - rect.x1)/2);
             }
             */

            translate.x = 0;
            translate.y = 0;
            scales.x = 1;
            scales.y = 1;


            console.log("containerDimension");
            console.log(containerDimension);
            console.log("rect");
            console.log(rect);
            console.log("scale");
            console.log(scales);
            console.log("translate");
            console.log(translate);

            svgRoot.attr("width", containerDimension.width)
                .attr("height", containerDimension.height);     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

            var graph = svgRoot.append("g")
                .attr("transform", "matrix(" + scales.x + "," + 0 + "," + 0 + "," + scales.y + "," + translate.x + "," + translate.y + ")")   // scaling affects transformation
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

renderInput("output.json");




