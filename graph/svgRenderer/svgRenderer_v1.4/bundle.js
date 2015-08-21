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

    }, {"./lib/compile": 2, "./lib/compile_template": 3, "add-event-listener": 5}],
    2: [function (require, module, exports) {
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

    }, {"../": 1, "./domparser.js": 4}],
    3: [function (require, module, exports) {
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
    4: [function (require, module, exports) {
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
    5: [function (require, module, exports) {
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

    }, {}],
    6: [function (require, module, exports) {
        var svg = require('simplesvg');
        var data, nodes, links, browserPos, graph;
        var xdata, xnodes, xlinks;

        var settings = {
            defaultDisplayDimension: {
                width: 400,
                height: 200
            }
        }

        renderInput("distributedData/0_0.json");

        renderExtraInput("distributedData/0_1.json");

// get data from server
        function renderInput(file) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {

                if (xhr.readyState == 4 && xhr.status == 200) {
                    data = JSON.parse(xhr.responseText);

                    browserPos = data.browserPos;
                    nodes = data.nodes;
                    links = data.links;

                    renderMainGraph();
        }
            }

            xhr.open("GET", file, true);
            xhr.send();

        }

        function renderExtraInput(file) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {

                if (xhr.readyState == 4 && xhr.status == 200) {
                    xdata = JSON.parse(xhr.responseText);

                    // not required, since we using browserPos of original section
                    // xbrowserPos = xdata.browserPos;
                    xnodes = xdata.nodes;
                    xlinks = xdata.links;

                    renderExtraGraph();
        }
            }

            xhr.open("GET", file, true);
            xhr.send();

        }


        function renderExtraGraph() {
            // render edges

            var linksDom = document.getElementById("links");

            xlinks.forEach(function (link) {

                linksDom.append("line")
                    .attr("x1", link.pos.from.x)   // if node1 in edge is 15, this will be nodesArr[15][0], to access x coord of node 15; internal d[0] refers to node1
                    .attr("y1", link.pos.from.y)
                    .attr("x2", link.pos.to.x)
                    .attr("y2", link.pos.to.y)
                    .attr("stroke-width", 1)
                    .attr("stroke", "#B8B8B8 ");
            });


            // render nodes

            xnodes.forEach(function (node) {
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
        }


        function renderMainGraph() {
            var translate = { // translate is negative, to make the whole canvas towards (0,0)
                    x: -(browserPos.col * settings.defaultDisplayDimension.width),
                    y: -(browserPos.row * settings.defaultDisplayDimension.height)
        }
                ;


            // rendering
            // set up svgRoot
            var svgRoot = svg("svg");

            document.body.appendChild(svgRoot);  //getElementById( ) can be used to substitute body

            svgRoot.attr("width", settings.defaultDisplayDimension.width)//settings.defaultDisplayDimension.width
                .attr("height", settings.defaultDisplayDimension.height)
                .attr("viewBox", "0 0 400 200")
                .attr("id", "graph");     // learning: height and width should be set to the overall svg canvas, instead of "g" within. It has no effect on "g"

            graph = svgRoot.append("g")
                .attr("transform", "translate(" + translate.x + "," + translate.y + ")");


            //console.log("Time before rendering: " + window.performance.now());
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

            // Performance measures
            window.performance.mark("mark_after_append");
            window.performance.measure("measure_append", "mark_before_append", "mark_after_append");
            //     console.log("Time after rendering: " + window.performance.now());
            var mark_all = window.performance.getEntriesByType("mark");
            var measure_all = window.performance.getEntriesByType("measure");
            // console.log("All marks are: ");
            // console.log(mark_all);
            // console.log("All measures are: ");
            // console.log(measure_all);
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
                    .attr("stroke", "#B8B8B8");
            });
        }


    }, {"simplesvg": 1}]
}, {}, [6]);
