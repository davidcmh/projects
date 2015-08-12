var settings = {
    defaultDisplayDimension: {
        x: 1280,
        y: 728
    }
}

var data, nodes, links, rectDimension;

var gdoDimension = {
    row: 1,
    col: 2
};

var fs = require('fs');
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

    var totalGdoDimension = {
        width: gdoDimension.col * settings.defaultDisplayDimension.x,
        height: gdoDimension.row * settings.defaultDisplayDimension.y
    }

    var scales = {
        x: totalGdoDimension.width / rectDimension.width,
        y: totalGdoDimension.height / rectDimension.height
    };

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

    var browserDimension = {};  // an array of dimension for each browser

    // TODO: compare efficiency between using array vs javascript object as data structure
    // first get dimension of each individual browser
    for (var i = 0; i < gdoDimension.row; ++i) {
        browserDimension[i] = {};       // need to assign it to an empty object first, can't directly use [0][0]
        for (var j = 0; j < gdoDimension.col; ++j) {
            browserDimension[i][j] = {
                x1: j * settings.defaultDisplayDimension.x,  // col num (j) multiplies by display width (note the inverse relationship, column multiples by width, not row multiples by width!)
                y1: i * settings.defaultDisplayDimension.y,  // row num (i) multiplies by display height
                x2: (j + 1) * settings.defaultDisplayDimension.x,
                y2: (i + 1) * settings.defaultDisplayDimension.y
            }
        }
    }


    // distribute data across different browsers
    // set up data structure to store data for each browser
    var graphData = [];
    for (var i = 0; i < gdoDimension.row; ++i) {
        graphData[i] = {};
        for (var j = 0; j < gdoDimension.col; ++j) {
            graphData[i][j] = {
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

    // check which browser a node belongs to
    var checkBrowserPos = function (nodePos) {
        return {
            row: Math.floor(nodePos.y / settings.defaultDisplayDimension.y),  // be careful of the inversion btw x & y!
            col: Math.floor(nodePos.x / settings.defaultDisplayDimension.x)
        }

    }

    nodes.forEach(function (node) {
        var nodeBrowserPos = checkBrowserPos(node.pos);
        graphData[nodeBrowserPos.row][nodeBrowserPos.col].nodes.push(node);
    });

    // output data to files
    for (var i = 0; i < gdoDimension.row; ++i) {
        for (var j = 0; j < gdoDimension.col; ++j) {
            fs.writeFile("distributedData/" + i + "_" + j + ".json", JSON.stringify(graphData[i][j]));
        }
    }


}
