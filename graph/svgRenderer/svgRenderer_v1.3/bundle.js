(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var settings = {
    defaultDisplayDimension: {
        x: 1920,
        y: 1080
    }
}

// split graph into multiple partitions
// based on dimension of display, in the form of [no. of rows, no. of cols]
// output partitions in json file, with naming convention 'row-col.json'
function distributeGraph(file, gdoDimension) {     //gdoDimension = {row: , col: }
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && xhr.status == 200) {

            var data, nodes, links, rectDimension;

            data = JSON.parse(xhr.responseText);

            nodes = data.nodes;
            links = data.links;
            rectDimension = data.rectDimension;


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
            var graphData = [];
            var browserDimension = {};  // an array of dimension for each browser

            // TODO: compare efficiency between using array vs javascript object as data structure
            // first get dimension of each individual browser
            for (var i = 0; i < gdoDimension.row; ++i) {
                browserDimension[i] = {};       // need to assign it to an empty object first, can't directly use [0][0]
                for (var j = 0; j < gdoDimension.col; ++j) {
                    browserDimension[i][j] = {
                        x1: j * settings.defaultDisplayDimension.x,
                        y1: i * settings.defaultDisplayDimension.y,
                        x2: (j + 1) * settings.defaultDisplayDimension.x,
                        y2: (i + 1) * settings.defaultDisplayDimension.y
                    }
                }
            }
            console.log(browserDimension);

        }

    }

    xhr.open("GET", file, true);
    xhr.send();

}

var gdoDimension = {
    row: 1,
    col: 2
}

distributeGraph("output.json", gdoDimension);


/*


var fs = require('fs');
fs.writeFileSync("output.json", JSON.stringify(data));

    */
},{}]},{},[1]);
