# SVG Renderer v1.2

This version separates data generation from rendering. Also, it implements scaling and translation before rendering (i.e. based on coordinates of nodes and links), instead of transforming SVG elements on a later stage which would lead to graphic distortion.