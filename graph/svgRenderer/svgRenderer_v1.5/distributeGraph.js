/*
 1. Set up dimensions of individual display and overall display config
 2. Read file and get data: nodes, links, rectDimension
 3. Distribute graph
 i. scale to overall dimension
 ii. distribute nodes & links into each browser
 iii. write data for individual browser into files
 */

// TODO: change attributes of display dimension from x, y to width, height; which are more accurate descriptors
var settings = {
    defaultDisplayDimension: {
        x: 400,
        y: 200
    }
}

var gdoDimension = {
    row: 3,
    col: 3
};


var totalGdoDimension = {
    width: gdoDimension.col * settings.defaultDisplayDimension.x,
    height: gdoDimension.row * settings.defaultDisplayDimension.y
}

var scales;

var fs = require('fs');


// reads from nodesPos.bin

fs.readFile("nodesPos.bin", function (err, data) {
    if (err)
        throw err;


    // rectDimension = [width, height]
    var rectDim = [data.readFloatLE(0), data.readFloatLE(4)];

    // nodes = [[x, y, numLinks], [], ...]
    var nodes = [];

    for (var i = 8; i < data.length; i += 12) {
        nodes.push([data.readFloatLE(i), data.readFloatLE(i + 4), data.readFloatLE(i + 8)]);
    }

    /*
     console.log("rectDimension width: " + rectDim[0]);
     console.log("rectDimension height: " + rectDim[1]);
     console.log("nodes length: " + nodes.length);
     console.log("nodes data: ")
     console.log(nodes);
     */
    setupScales(rectDim);

    //distributeNodes(rectDim, nodes);

})


// reads from linksPos.bin

fs.readFile("linksPos.bin", function (err, data) {
    if (err)
        throw err;

    // links = [[x1, y1, x2, y2], [], ...]
    var links = [];

    for (var i = 0; i < data.length; i += 16) {
        links.push([data.readFloatLE(i), data.readFloatLE(i + 4), data.readFloatLE(i + 8), data.readFloatLE(i + 12)]);
    }

    /*
     console.log("links length: " + links.length);
     console.log("links data: ")
     console.log(links);
     */

})


// set up scales for transformation
function setupScales(rectDim) {
    scales = {
        x: totalGdoDimension.width / rectDim[0],
        y: totalGdoDimension.height / rectDim[1]
    };

    /*
     console.log("total gdo dimension: ");
     console.log(totalGdoDimension);
     console.log("rect dimension: ");
     console.log(rectDim);
     console.log("scales: ");
     console.log(scales);
     */
}


// @param rectDim = [width, height], nodes = [[x, y, numLinks], [], ...]
function distributeNodes(rectDim, nodes) {

}


var data, nodes, links, rectDimension;

// reads from output.json

fs.readFile("output.json", function read(err, data) {
    if (err) {
        throw err;
    }

    data = JSON.parse(data);

    nodes = data.nodes;
    links = data.links;
    rectDimension = data.rectDimension;


    distributeGraph(gdoDimension);
});


// split graph into multiple partitions
// based on dimension of display, in the form of [no. of rows, no. of cols]
// output partitions in json file, with naming convention 'row-col.json'
function distributeGraph(gdoDimension) {     //gdoDimension = {row: , col: }


    // transform data to GDO dimension


    // TODO: Refactor scaling, since it's used in both distributeGraph.js and index.js
    // scaleDown  makes the overall graph smaller and nearer to (0, 0)
    var scaleDown = 0.9;

    nodes.forEach(function (node) {

        node.pos.x *= scales.x * scaleDown;
        node.pos.y *= scales.y * scaleDown;

        node.pos.x += totalGdoDimension.width * (1 - scaleDown) / 2;    // add padding to x & y to centralise graph
        node.pos.y += totalGdoDimension.height * (1 - scaleDown) / 2;
    });

    links.forEach(function (link) {

        link.pos.from.x *= scales.x * scaleDown;
        link.pos.from.y *= scales.y * scaleDown;
        link.pos.to.x *= scales.x * scaleDown;
        link.pos.to.y *= scales.y * scaleDown;

        link.pos.from.x += totalGdoDimension.width * (1 - scaleDown) / 2;
        link.pos.from.y += totalGdoDimension.height * (1 - scaleDown) / 2;
        link.pos.to.x += totalGdoDimension.width * (1 - scaleDown) / 2;
        link.pos.to.y += totalGdoDimension.height * (1 - scaleDown) / 2;
    });


    // split files based on no. of browsers


    // distribute data across different browsers
    // set up data structure to store data for each browser
    var partitionData = [];
    for (var i = 0; i < gdoDimension.row; ++i) {
        partitionData[i] = {};
        for (var j = 0; j < gdoDimension.col; ++j) {
            partitionData[i][j] = {
                browserPos: {     // store position of browser
                    row: i,
                    col: j
                },
                nodes: [],     // array to store nodes data
                links: []
            };
        }
        ;
    }
    ;


    // distribute nodes

    // check which browser a point belongs to
    var checkBrowserPos = function (pos) {
        return {
            row: Math.floor(pos.y / settings.defaultDisplayDimension.y),  // be careful of the inversion btw x & y!
            col: Math.floor(pos.x / settings.defaultDisplayDimension.x)
        }

    }

    nodes.forEach(function (node) {
        var nodeBrowserPos = checkBrowserPos(node.pos);
        partitionData[nodeBrowserPos.row][nodeBrowserPos.col].nodes.push(node);
    });


    // distribute links
    links.forEach(function (link) {
        var startPos, endPos;

        // set starting point to the one with smaller x, without changing original data
        if (link.pos.from.x > link.pos.to.x) {
            startPos = link.pos.to;
            endPos = link.pos.from;
        } else {
            startPos = link.pos.from;
            endPos = link.pos.to;
        }

        var startBrowserPos = checkBrowserPos(startPos);
        var endBrowserPos = checkBrowserPos(endPos);

        // colDiff will always be >= 0, since we have set starting point's x to be smaller
        // rowDiff may be < 0
        var colDiff = endBrowserPos.col - startBrowserPos.col;
        var rowDiff = endBrowserPos.row - startBrowserPos.row;

        // set lines to check for intersection
        var horizontalLines = [];  // y = a
        var verticalLines = [];   // x = b

        for (var i = 0; i < colDiff; ++i) {
            verticalLines.push((startBrowserPos.col + 1 + i) * settings.defaultDisplayDimension.x);
        }

        if (rowDiff > 0) {
            for (var i = 0; i < rowDiff; ++i) {
                horizontalLines.push((startBrowserPos.row + 1 + i) * settings.defaultDisplayDimension.y);
            }
        } else if (rowDiff < 0) {
            for (var i = -rowDiff; i > 0; --i) {
                horizontalLines.push((startBrowserPos.row + 1 - i) * settings.defaultDisplayDimension.y);
            }
        }

        // check for different cases & push link onto respective browser

        // regardless of where the end point is, the starting browser definitely should have the link
        // equivalently to basic case where colDiff == 0 && rowDiff == 0
        partitionData[startBrowserPos.row][startBrowserPos.col].links.push(link);

        // cases:
        // 1. both in the same browser
        // 2. both in different browsers, but on the same row or same col
        // 3. both in different browsers, diff row and diff col

        if (rowDiff != 0 && colDiff == 0) {
            // no colDiff means all are on same column, but different rows
            if (rowDiff > 0) {
                for (var i = 0; i < rowDiff; ++i) {
                    partitionData[startBrowserPos.row + 1 + i][startBrowserPos.col].links.push(link);
                }
            } else { //rowDiff < 0
                for (var i = -rowDiff; i > 0; --i) {  // previous bug, didn't put - in front of rowDiff, this condition will always be false, since rowDiff is negative at the start
                    partitionData[startBrowserPos.row - i][startBrowserPos.col].links.push(link);
                }
            }
        } else if (rowDiff == 0 && colDiff != 0) {
            for (var i = 0; i < colDiff; ++i) {
                partitionData[startBrowserPos.row][startBrowserPos.col + 1 + i].links.push(link);
            }
        } else if (rowDiff != 0 && colDiff != 0) {
            // check for intersections & place into respective browsers

            // calculate line equation y = mx + c
            var m = (endPos.y - startPos.y) / (endPos.x - startPos.x);
            var c = startPos.y - (m * startPos.x);

            // get intersection points
            var intersections = [];

            horizontalLines.forEach(function (y) { // y = ' '; hence check for x
                intersections.push({
                    pos: {
                        x: (y - c) / m,
                        y: y
                    },
                    type: "horizontal",
                    number: Math.floor(((y - c) / m) / settings.defaultDisplayDimension.x)  // to get which col it belongs to
                })
            });

            verticalLines.forEach(function (x) { // x = ' '; hence check for y
                intersections.push({
                    pos: {
                        x: x,
                        y: (m * x) + c
                    },
                    type: "vertical",
                    number: Math.floor(((m * x) + c) / settings.defaultDisplayDimension.y)  // to get which row it belongs to
                })
            });

            // sort intersections according to x
            intersections.sort(function (a, b) {
                if (a.pos.x > b.pos.x) {
                    return 1;
                }
                if (a.pos.x < b.pos.x) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });


            // place link into respective browsers based on intersection points
            for (var i = 0; i < intersections.length - 1; ++i) {  // intersections.length - 1 because the loop handles two intersections at a time

                if (intersections[i].type == "vertical" && intersections[i + 1].type == "horizontal") {
                    partitionData[intersections[i].number][intersections[i + 1].number].links.push(link);
                } else if (intersections[i].type == "horizontal" && intersections[i + 1].type == "vertical") {
                    partitionData[intersections[i + 1].number][intersections[i].number].links.push(link);
                } else if (intersections[i].type == "vertical" && intersections[i + 1].type == "vertical") {
                    partitionData[intersections[i].number][intersections[i].pos.x / settings.defaultDisplayDimension.x].links.push(link);
                } else if (intersections[i].type == "horizontal" && intersections[i + 1].type == "horizontal") {
                    // Math.min is used to find the smaller y and get its row
                    partitionData[Math.min(intersections[i].pos.y, intersections[i + 1].pos.y) / settings.defaultDisplayDimension.y][intersections[i].number].links.push(link);
                }

            }
            ;

            //
            partitionData[endBrowserPos.row][endBrowserPos.col].links.push(link);

        }

    });


    // output data to files
    for (var i = 0; i < gdoDimension.row; ++i) {
        for (var j = 0; j < gdoDimension.col; ++j) {
            fs.writeFile("distributedData/" + i + "_" + j + ".json", JSON.stringify(partitionData[i][j]));
        }
    }


}
