import { ArrayList } from "./collection.js";
import { BorderBox, Tool } from "./util.js";
import { Vector3 } from "./vector.js";
import { Style } from './style.js'
import { EventListener } from "./event.js";
import { BoxComponent, Component, TransformComponent } from './component.js'
import { Matrix3 } from "./matrix.js";

enum ShapeType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT };

class Shape {

    public get shapeType() { return ShapeType.SHAPE; }

    constructor(){ }

    getPoints() : Array< Vector3 > {
        return new Array< Vector3 > ();
    };

}

class Path extends Shape {

    public points : Array<Vector3>;

    public get shapeType() { return ShapeType.PATH; }

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

class Arc extends Shape {
    
    public from : number;
    public to : number; 
    public radius : number; 
    public startAngle : number ;
    public endAngle : number;

    public get shapeType() { return ShapeType.ARC; }

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

    public get shapeType() { return ShapeType.CIRCLE; }

    constructor( r = 1 ){
        super(0 , 360 , r);
    }

}

class Ellipse extends Shape {

    public a : number;
    public b : number;

    public get shapeType() { return ShapeType.ELLIPSE; }

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

class Rectangle extends Shape{

    public width : number;
    public height : number;

    public get shapeType() { return ShapeType.RECTANGLE; }

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

class Polygon extends Shape{
    
    public points : Array<Vector3>;

    public get shapeType() { return ShapeType.POLYGON; }

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

class Convex extends Polygon{

    constructor( points : Array<Vector3> ){
        points = Tool.GetConvex( points );
        super( points );
    }


}

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

class Text extends Shape {
    
    public text : string ;
    public fontSize : number;
    public _size : number ;
    public _family : string;

    public _baseline : string ;

    public get shapeType() { return ShapeType.TEXT; }

    public get size(){ return this._size ;}

    public get family(){ return this._family; }

    public get baseline(){
        return this._baseline;
    }

    public set size( size : number ) { 
        this._size = size;
    }

    public set baseline( _baseline : string ) { 
        this._baseline = _baseline ;
    }

    public set family( family : string ) { 
        this._family = family;
    }
    
    constructor( text : string ){
        super( );
        this.text = text;
        this.fontSize = 10;
    }

}


export { Shape , Path , Arc , Circle , Ellipse , Rectangle , Polygon , Convex , QuadraticBezierCurve , ShapeType ,Text }