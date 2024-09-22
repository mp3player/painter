import { Vector3 } from "../math/vector.js";
import { Geometry, GeometryType } from "./geometry.js";


class Arc extends Geometry {
    
    public from : number;
    public to : number; 
    public radius : number; 
    public startAngle : number ;
    public endAngle : number;

    public get shapeType() { return GeometryType.ARC; }

    constructor( startAngle : number = 0.0 , endAngle : number = 90.0 , radius : number = 100){

        super();

        this.startAngle = startAngle * Math.PI / 180;
        this.endAngle = endAngle * Math.PI / 180;
        this.radius = radius;
        
    }

    getPoints() : Array< Vector3 > {
        
        // TODO : step should be calculated according the radius and the transform matrix
        let step : number = Math.floor( Math.PI * this.radius / 4 );
        let stride : number = ( this.endAngle - this.startAngle ) / step;
        let points : Array< Vector3 > = new Array< Vector3 >();

        for( let i = 0 ; i < step ; ++ i ){
            let x : number = Math.cos( i * stride ) * this.radius;
            let y : number = Math.sin( i * stride ) * this.radius;
            points.push( new Vector3( x , y ) );
        }
        
        return points;
    
    };

}


class Circle extends Arc{

    public get shapeType() { return GeometryType.CIRCLE; }

    constructor( r = 1 ){
        super(0 , 360 , r);
    }

}

export { Arc , Circle }