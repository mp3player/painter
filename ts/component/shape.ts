import { Component } from "./component.js";
import { Shape } from "../geometry.js";
import { Vector3 } from "../vector.js";


class ShapeComponent extends Component {

    public shape : Shape;
    private points : Array< Vector3 > = new Array< Vector3 >; 

    public constructor( shape : Shape , name : string = "shape" ){
        super( name );
        this.shape = shape;
    }

    public updateOnce( deltaTime: number ): void {

        if( this._needUpdate ){
            this.points = this.shape.getPoints();
            this._needUpdate = false;
        }

    }

    public getPoints() : Array< Vector3 > {
        
        return this.points;

    }

}


export { ShapeComponent }