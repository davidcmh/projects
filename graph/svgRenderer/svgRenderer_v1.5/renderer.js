var svg = require('simplesvg');


/* Optimised split rendering
 1. Read individual partition (no need to scale, since it's already scaled in distributeGraph)
 2. translate by respective
 3. render (each browser now renders 4 partitions, 2 x 2)
 */

// change this dimension manually depending on available dimension for svg
var containerDim = {
    width: 1400,
    height: 800
}

var gdoDimension = {
    row: 8,
    col: 8
}

for (var i = 0; i < gdoDimension.row; ++i) {
    for (var j = 0; j < gdoDimension.col; ++j) {
        renderNodes("distributedData/nodesPos/" + i + "_" + j + ".bin");
        getLinksAndRender("distributedData/linksPos/" + i + "_" + j + ".bin");
    }
}

/*
 renderNodes("distributedData/nodesPos/1_3.bin");
 getLinksAndRender("distributedData/linksPos/1_3.bin");

 renderNodes("distributedData/nodesPos/2_4.bin");
 getLinksAndRender("distributedData/linksPos/2_4.bin");

 renderNodes("distributedData/nodesPos/3_2.bin");
 getLinksAndRender("distributedData/linksPos/3_2.bin");

 renderNodes("distributedData/nodesPos/3_5.bin");
 getLinksAndRender("distributedData/linksPos/3_5.bin");

 renderNodes("distributedData/nodesPos/4_3.bin");
 getLinksAndRender("distributedData/linksPos/4_3.bin");

 renderNodes("distributedData/nodesPos/4_6.bin");
 getLinksAndRender("distributedData/linksPos/4_6.bin");

 renderNodes("distributedData/nodesPos/5_4.bin");
 getLinksAndRender("distributedData/linksPos/5_4.bin");

 renderNodes("distributedData/nodesPos/6_5.bin");
 getLinksAndRender("distributedData/linksPos/6_5.bin");
 */

// set up svgRoot
var svgRoot = svg("svg");

var graph = svgRoot.append("g");
//.attr("transform", "translate(" + translate.x + "," + translate.y + ")")
//.attr("id", partitionPos[0] + "_" + partitionPos[1]);

var linksDom = graph.append("g")
    .attr("class", "links");

var nodesDom = graph.append("g")
    .attr("class", "nodes");

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

                nodesDom.append("circle")
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

            // partitionPos = [row, col]
            var partitionPos = [data[0], data[1]];

            // links = [[x1, y1, x2, y2], [], ...]
            links = [];

            // read links data and add each link onto array
            for (var i = 2; i < data.length - 3; i += 4) {
                links.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
            }

            // render edges
            renderLinks(links);
        }

    };
}


renderLinks = function (links) {

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
