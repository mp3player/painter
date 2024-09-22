import { Vector3 } from "../math/vector";
import { Geometry, GeometryType } from "./geometry";

class Rectangle extends Geometry{

    public width : number;
    public height : number;

    public get shapeType() { return GeometryType.RECTANGLE; }

    constructor( width : number , height : number , x = 0 , y = 0 ){
        super();
        this.width = width;
        this.height = height;
    }

    getPoints() : Array< Vector3 > {
        
        let hw : number = this.width / 2;
        let hh : number = this.height / 2;
        
        return [
            new Vector3( -hw , -hh ),
            new Vector3(  hw , -hh ),
            new Vector3(  hw ,  hh ),
            new Vector3( -hw ,  hh ),
        ];

    };

}

export { Rectangle }