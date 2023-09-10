+ all the computation of the coordinate will be applied in the world geometry
    + box.union
    + box.intersection
    + point in polygon

+ Shape 
    - Line
    - Rectangle
    - Polygon
    - Circle
    

+ render
    - cache data (cache data can be used to draw the shape and algorithm implementation)
    - use cache to draw shape
    - update cache and goto the first

+ Convex Collision
    - GJK algorithm


+ event 
    + event delegation
        - painter listen the event & generate event object
        - emit the information to it's children until the leave node

    + event bubble
        - painter listen the event 
        - checkout the leave of the tree 
        - emit the information to it's parent until the root node
