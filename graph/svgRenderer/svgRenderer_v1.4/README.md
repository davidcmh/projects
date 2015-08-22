#SVG Renderer v1.4

This version experiments zooming & panning capabilities.

It also tested panning with distributed rendering (i.e. loaded two files (with only one of them in view), and then pan across to see the other part)

#Earlier versions:

##SVG Renderer v1.3

This version implements distributed rendering. It receives GDO dimension as input, then rescale and transform coordinates, before outputting multiple data files to be rendered by individual browsers.

index.js renders the whole graph from raw data - output.json;
whereas renderer.js renders individual browser based on processed data, stored in the folder 'distributedData', in the form of 'row_col.json'.