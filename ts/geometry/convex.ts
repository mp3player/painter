import { GMath } from "../math/math.js";
import { Vector3 } from "../math/vector.js";
import { Polygon } from "./polygon.js";

class Convex extends Polygon{

    constructor( points : Array<Vector3> ){
        points = GMath.GetConvex( points );
        super( points );
    }


}

export { Convex }