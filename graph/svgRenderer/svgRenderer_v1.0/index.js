var svg = require('simplesvg');
var graphics = require('./svg.js');


var svgRoot = svg("svg");

document.getElementById("testing").appendChild(svgRoot);

var svgContainer = svg("g")
    .attr("buffered-rendering", "dynamic");

svgRoot.appendChild(svgContainer);

var rect = svg("rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("fill", "#00a2e8")
    .attr("x", 50)
    .attr("y", 50);



svgContainer.appendChild(rect);

//document.body.appendChild(svgRoot);

