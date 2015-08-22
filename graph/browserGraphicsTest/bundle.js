(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a)return a(o, !0);
                if (i)return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {exports: {}};
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }

    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++)s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        var svg = require('simplesvg');


// set up svgRoot
        var svgRoot = svg("svg");

        document.getElementById("graph").appendChild(svgRoot);  //getElementById( ) can be used to substitute body


// set up container for graph
        var width, height;
        width = document.body.clientWidth;
        height = document.body.clientHeight;


        svgRoot.attr("width", width)
            .attr("height", height);     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

        var graph = svgRoot.append("g")
            .attr("class", "graph")
            .attr("buffered-rendering", "static");


// set up data

        console.log(performance.now());
// set up nodes
        var numNodes = 100000;
        var nodesArr = [];

        for (var i = 0; i < numNodes; i++) {
            nodesArr.push([Math.floor(Math.random() * width), Math.floor(Math.random() * height)]);
        }
        console.log(performance.now());

// edge iterator to check for duplicates
        var checkDuplicate = function (arr, edge) {
            var duplicate = false;                     // set an extra variable because we cannot break from forEach loop
            arr.forEach(function (d) {
                if (+d[0] == +edge[0] && +d[1] == +edge[1]) {
                    duplicate = true;
                    return;   // cannot break it but we can return it
                }
            });
            return duplicate;
        };


// TODO: improve edges data structure, use an adjacency matrix maybe?
// set up edges
        var numEdges = 0;
        var edgesArr = [];

        for (var i = 0; i < numEdges; i++) {

            var edge;

            do {
                var node1 = Math.floor(Math.random() * numNodes);
                var node2 = Math.floor(Math.random() * numNodes);

                while (node2 == node1) {
                    node2 = Math.floor(Math.random() * numNodes);
                }

                if (node1 > node2) {   // make node1 the smaller node, to simplify check later on
                    var temp = node1;
                    node1 = node2;
                    node2 = temp;
                }

                edge = [node1, node2];

            }
            while (checkDuplicate(edgesArr, edge));  // if there is duplicate, regenerate the edge

            edgesArr.push(edge);
        }


        console.log("Time before rendering: " + window.performance.now());
        window.performance.mark("mark_before_append");
// rendering

// render edges
        edgesArr.forEach(function (d) {
            graph.append("line")
                .attr("x1", nodesArr[d[0]][0])   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
                .attr("y1", nodesArr[d[0]][1])
                .attr("x2", nodesArr[d[1]][0])
                .attr("y2", nodesArr[d[1]][1])
                .attr("stroke-width", 1)
                .attr("stroke", "#B8B8B8 ");
        });


// render nodes
        /*
         nodesArr.forEach(function (d) {
         graph.append("circle")
         .attr("r", 1)
         .attr("cx", d[0])
         .attr("cy", d[1])
         .attr("fill", "teal")
         ;
         });
         */

        window.performance.mark("mark_after_append");

        window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
        console.log("Time after rendering: " + window.performance.now());


        var mark_all = window.performance.getEntriesByType("mark");

        var measure_all = window.performance.getEntriesByType("measure");

        console.log("All marks are: ");
        console.log(mark_all);
        console.log("All measures are: ");
        console.log(measure_all);


        var start = null;
        var element = document.getElementById("graph");

        var i = 0;

        function step(timestamp) {

            if (!start) start = timestamp;
            var progress = timestamp - start;

            var j = i + 10;

            for (; i < nodesArr.length && i < j; ++i) {
                graph.append("circle")
                    .attr("r", 1)
                    .attr("cx", nodesArr[i][0])
                    .attr("cy", nodesArr[i][1])
                    .attr("fill", "teal")
                ;
            }

            if (i < nodesArr.length) {
                console.log("yes it's running");
                window.requestAnimationFrame(step);
            }
        }

//window.requestAnimationFrame(step);

        step(0);
    }, {"simplesvg": 2}],
    2: [function (require, module, exports) {
        module.exports = svg;

        svg.compile = require('./lib/compile');

        var compileTemplate = svg.compileTemplate = require('./lib/compile_template');

        var domEvents = require('add-event-listener');

        var svgns = "http://www.w3.org/2000/svg";
        var xlinkns = "http://www.w3.org/1999/xlink";

        function svg(element, attrBag) {
            var svgElement = augment(element);
            if (attrBag === undefined) {
                return svgElement;
            }

            var attributes = Object.keys(attrBag);
            for (var i = 0; i < attributes.length; ++i) {
                var attributeName = attributes[i];
                var value = attrBag[attributeName];
                if (attributeName === 'link') {
                    svgElement.link(value);
                } else {
                    svgElement.attr(attributeName, value);
                }
            }

            return svgElement;
        }

        function augment(element) {
            var svgElement = element;

            if (typeof element === "string") {
                svgElement = window.document.createElementNS(svgns, element);
            } else if (element.simplesvg) {
                return element;
            }

            var compiledTempalte;

            svgElement.simplesvg = true; // this is not good, since we are monkey patching svg
            svgElement.attr = attr;
            svgElement.append = append;
            svgElement.link = link;
            svgElement.text = text;

            // add easy eventing
            svgElement.on = on;
            svgElement.off = off;

            // data binding:
            svgElement.dataSource = dataSource;

            return svgElement;

            function dataSource(model) {
                if (!compiledTempalte) compiledTempalte = compileTemplate(svgElement);
                compiledTempalte.link(model);
                return svgElement;
            }

            function on(name, cb, useCapture) {
                domEvents.addEventListener(svgElement, name, cb, useCapture);
                return svgElement;
            }

            function off(name, cb, useCapture) {
                domEvents.removeEventListener(svgElement, name, cb, useCapture);
                return svgElement;
            }

            function append(content) {
                var child = svg(content);
                svgElement.appendChild(child);

                return child;
            }

            function attr(name, value) {
                if (arguments.length === 2) {
                    if (value !== null) {
                        svgElement.setAttributeNS(null, name, value);
                    } else {
                        svgElement.removeAttributeNS(null, name);
            }

                    return svgElement;
        }

                return svgElement.getAttributeNS(null, name);
            }

            function link(target) {
                if (arguments.length) {
                    svgElement.setAttributeNS(xlinkns, "xlink:href", target);
                    return svgElement;
        }

                return svgElement.getAttributeNS(xlinkns, "xlink:href");
            }

            function text(textContent) {
                if (textContent !== undefined) {
                    svgElement.textContent = textContent;
                    return svgElement;
                }
                return svgElement.textContent;
            }
        }

    }, {"./lib/compile": 3, "./lib/compile_template": 4, "add-event-listener": 6}],
    3: [function (require, module, exports) {
        var parser = require('./domparser.js');
        var svg = require('../');

        module.exports = compile;

        function compile(svgText) {
            try {
                svgText = addNamespaces(svgText);
                return svg(parser.parseFromString(svgText, "text/xml").documentElement);
            } catch (e) {
                throw e;
            }
        }

        function addNamespaces(text) {
            if (!text) return;

            var namespaces = 'xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"';
            var match = text.match(/^<\w+/);
            if (match) {
                var tagLength = match[0].length;
                return text.substr(0, tagLength) + ' ' + namespaces + ' ' + text.substr(tagLength);
            } else {
                throw new Error('Cannot parse input text: invalid xml?');
            }
        }

    }, {"../": 2, "./domparser.js": 5}],
    4: [function (require, module, exports) {
        module.exports = template;

        var BINDING_EXPR = /{{(.+?)}}/;

        function template(domNode) {
            var allBindings = Object.create(null);
            extractAllBindings(domNode, allBindings);

            return {
                link: function (model) {
                    Object.keys(allBindings).forEach(function (key) {
                        var setter = allBindings[key];
                        setter.forEach(changeModel);
                    });

                    function changeModel(setter) {
                        setter(model);
            }
        }
            };
        }

        function extractAllBindings(domNode, allBindings) {
            var nodeType = domNode.nodeType;
            var typeSupported = (nodeType === 1) || (nodeType === 3);
            if (!typeSupported) return;
            var i;
            if (domNode.hasChildNodes()) {
                var domChildren = domNode.childNodes;
                for (i = 0; i < domChildren.length; ++i) {
                    extractAllBindings(domChildren[i], allBindings);
                }
            }

            if (nodeType === 3) { // text:
                bindTextContent(domNode, allBindings);
            }

            if (!domNode.attributes) return; // this might be a text. Need to figure out what to do in that case

            var attrs = domNode.attributes;
            for (i = 0; i < attrs.length; ++i) {
                bindDomAttribute(attrs[i], domNode, allBindings);
            }
        }

        function bindDomAttribute(domAttribute, element, allBindings) {
            var value = domAttribute.value;
            if (!value) return; // unary attribute?

            var modelNameMatch = value.match(BINDING_EXPR);
            if (!modelNameMatch) return; // does not look like a binding

            var attrName = domAttribute.localName;
            var modelPropertyName = modelNameMatch[1];
            var isSimpleValue = modelPropertyName.indexOf('.') < 0;

            if (!isSimpleValue) throw new Error('simplesvg currently does not support nested bindings');

            var propertyBindings = allBindings[modelPropertyName];
            if (!propertyBindings) {
                propertyBindings = allBindings[modelPropertyName] = [attributeSetter];
            } else {
                propertyBindings.push(attributeSetter);
            }

            function attributeSetter(model) {
                element.setAttributeNS(null, attrName, model[modelPropertyName]);
            }
        }

        function bindTextContent(element, allBindings) {
            // todo reduce duplication
            var value = element.nodeValue;
            if (!value) return; // unary attribute?

            var modelNameMatch = value.match(BINDING_EXPR);
            if (!modelNameMatch) return; // does not look like a binding

            var modelPropertyName = modelNameMatch[1];
            var isSimpleValue = modelPropertyName.indexOf('.') < 0;

            var propertyBindings = allBindings[modelPropertyName];
            if (!propertyBindings) {
                propertyBindings = allBindings[modelPropertyName] = [textSetter];
            } else {
                propertyBindings.push(textSetter);
            }

            function textSetter(model) {
                element.nodeValue = model[modelPropertyName];
            }
        }

    }, {}],
    5: [function (require, module, exports) {
        module.exports = createDomparser();

        function createDomparser() {
            if (typeof DOMParser === 'undefined') {
                return {
                    parseFromString: fail
                };
            }
            return new DOMParser();
        }

        function fail() {
            throw new Error('DOMParser is not supported by this platform. Please open issue here https://github.com/anvaka/simplesvg');
        }

    }, {}],
    6: [function (require, module, exports) {
        addEventListener.removeEventListener = removeEventListener
        addEventListener.addEventListener = addEventListener

        module.exports = addEventListener

        var Events = null

        function addEventListener(el, eventName, listener, useCapture) {
            Events = Events || (
                    document.addEventListener ?
                    {add: stdAttach, rm: stdDetach} :
                    {add: oldIEAttach, rm: oldIEDetach}
                )

            return Events.add(el, eventName, listener, useCapture)
        }

        function removeEventListener(el, eventName, listener, useCapture) {
            Events = Events || (
                    document.addEventListener ?
                    {add: stdAttach, rm: stdDetach} :
                    {add: oldIEAttach, rm: oldIEDetach}
                )

            return Events.rm(el, eventName, listener, useCapture)
        }

        function stdAttach(el, eventName, listener, useCapture) {
            el.addEventListener(eventName, listener, useCapture)
        }

        function stdDetach(el, eventName, listener, useCapture) {
            el.removeEventListener(eventName, listener, useCapture)
        }

        function oldIEAttach(el, eventName, listener, useCapture) {
            if (useCapture) {
                throw new Error('cannot useCapture in oldIE')
            }

            el.attachEvent('on' + eventName, listener)
        }

        function oldIEDetach(el, eventName, listener, useCapture) {
            el.detachEvent('on' + eventName, listener)
        }

    }, {}]
}, {}, [1]);
