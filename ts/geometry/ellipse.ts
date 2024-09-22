import { Matrix3 } from "../math/matrix.js";
import { Vector3 } from "../math/vector.js";
import { Geometry, GeometryType } from "./geometry.js";


class Ellipse extends Geometry {

    public a : number;
    public b : number;

    public get shapeType() { return GeometryType.ELLIPSE; }

    constructor( a = 1 , b = 1 ){
        super();
        this.a = a;
        this.b = b;
    }

    getPoints() : Array< Vector3 > {
        let mat : Matrix3 = new Matrix3( this.a , 0, 0, 0, this.b, 0, 0, 0, 1 );
        let step : number = Math.floor( Math.PI * 2 * Math.sqrt( this.a * this.b ) );
        let stride : number = Math.PI * 2 / step;
        let edge : Array< Vector3 > = new Array< Vector3 >;

        for( let i = 0 ; i < step ; ++i ){
            edge.push( new Vector3( Math.cos( i * stride ) , Math.sin( i * stride ) ).applyTransform( mat ) );
        }

        return edge;
    };


};

export { Ellipse }