import { Vector3 } from "../math/vector.js";
import { Geometry, GeometryType } from "./geometry.js";


class Polygon extends Geometry{
    
    public points : Array<Vector3>;

    public get shapeType() { return GeometryType.POLYGON; }

    constructor( points : Array<Vector3>){
        super();
        this.points = points;
    }

    append( vertex : Vector3 ){

        this.points.push( vertex );

    }

    getPoints() : Array< Vector3 > {
        return this.points;
    };


}

export { Polygon }