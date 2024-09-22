import { Vector3 } from "../math/vector.js";
import { Geometry, GeometryType } from "./geometry.js";

class Path extends Geometry {

    public points : Array<Vector3>;

    public get shapeType() { return GeometryType.PATH; }

    constructor( ){
        super();
        this.points = new Array<Vector3>();
    }

    append( point : Vector3 ){
        this.points.push( point );
    }

    getPoints() : Array< Vector3 > {
        return this.points;
    };

}


export { Path }