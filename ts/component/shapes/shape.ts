import { Component } from "../component.js";

import { Vector3 } from "../../math/vector.js";
import { Geometry } from "../../geometry/geometry.js";


class GeometryComponent extends Component {

    public geometry : Geometry;
    private points : Array< Vector3 > = new Array< Vector3 >; 

    public constructor( shape : Geometry , name : string = "shape" ){
        super( name );
        this.renderable = true;
        this.geometry = shape;
    }

    public update( deltaTime: number ): void {
        if( this._needUpdate ){
            this.points = this.geometry.getPoints();
            this._needUpdate = false;
        }
    }

    public getPoints() : Array< Vector3 > {
        return this.points;
    }

}


export { GeometryComponent }