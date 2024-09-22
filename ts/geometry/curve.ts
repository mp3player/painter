import { Vector3 } from "../math/vector";
import { Path } from "./path";


class QuadraticBezierCurve extends Path{

    public p0 : Vector3;
    public p1 : Vector3;
    public p2 : Vector3;

    constructor( p0 : Vector3 , p1 : Vector3 , p2 : Vector3 ){
        super();
        this.p0 = p0 ;
        this.p1 = p1 ;
        this.p2 = p2 ;
    }

    getPoints() : Array< Vector3 > {
        return new Array< Vector3 > ();
    };


}

export { QuadraticBezierCurve }