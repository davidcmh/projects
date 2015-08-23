#SVG Renderer v1.5

Implementations:
1. generateData.js
- Streamlined I/O by separating single output.json into multiple output files, to increase read speed and eliminate unnecessary read for downstream processes.
- Output files are: nodesPos.bin, linksPos.bin, nodes.json, labels.json
    - nodePos.bin stores data in byte array. for each node, it stores two info: x, y position, no. of connected nodes
    - linkPos.bin stores data in byte array. for each link, it store x, y positions for start and end points.
    - nodes.json stores all information of each node: {id, pos, connected nodes}
    - labels.json stores labels for each node: {id, label}
    - linksDistribution.json: record distribution of no. of links for all nodes

2. distributeGraph.js
- Partition raw data into buckets based on specified dimension and write into individual partition file
- Reads nodesPos.bin and outputs each partition into distributedData/nodes/row_col.bin
- tested 2x2, 4x4, 8x8, all works perfectly :)

3. index.js & renderer.js
- implements functions to read from binary files


#Earlier versions:

#SVG Renderer v1.4

This version implements zooming & panning capabilities. It adds refinements in UI, which include a different colour scheme and better user control.

It also tested panning with distributed rendering in renderer.js (i.e. loaded two files (with only one of them in view), and then pan across to see the other part).

##SVG Renderer v1.3

This version implements distributed rendering. It receives GDO dimension as input, then rescale and transform coordinates, before outputting multiple data files to be rendered by individual browsers.

index.js renders the whole graph from raw data - output.json;
whereas renderer.js renders individual browser based on processed data, stored in the folder 'distributedData', in the form of 'row_col.json'.

## SVG Renderer v1.2

This version separates data generation from rendering. Also, it implements scaling and translation before rendering (i.e. based on coordinates of nodes and links), instead of transforming SVG elements on a later stage which would lead to graphic distortion.