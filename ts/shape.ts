import { ArrayList } from "./collection.js";
import { BorderBox, Tool } from "./util.js";
import { Matrix, Vector } from "./vector.js";
import { Style } from './style.js'
import { EventListener } from "./event.js";
import { BoxComponent, Component, TransformComponent } from './component.js'

enum ShapeType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT };

class Shape {

    public get shapeType() { return ShapeType.SHAPE; }

    constructor(){ }

    getPoints() : Array< Vector > {
        return new Array< Vector > ();
    };

}

class Path extends Shape {

    public points : Array<Vector>;

    public get shapeType() { return ShapeType.PATH; }

    constructor( ){
        super();
        this.points = new Array<Vector>();
    }

    append( point : Vector ){
        this.points.push( point );
    }

    getPoints() : Array< Vector > {
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

    getPoints() : Array< Vector > {
        
        // TODO : step should be calculated according the radius and the transform matrix
        let step : number = Math.floor( Math.PI * this.radius / 4 );
        let stride : number = ( this.endAngle - this.startAngle ) / step;
        let points : Array< Vector > = new Array< Vector >();

        for( let i = 0 ; i < step ; ++ i ){
            let x : number = Math.cos( i * stride ) * this.radius;
            let y : number = Math.sin( i * stride ) * this.radius;
            points.push( new Vector( x , y ) );
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

    getPoints() : Array< Vector > {
        let mat : Matrix = new Matrix( this.a , 0, 0, 0, this.b, 0, 0, 0, 1 );
        let step : number = Math.floor( Math.PI * 2 * Math.sqrt( this.a * this.b ) );
        let stride : number = Math.PI * 2 / step;
        let edge : Array< Vector > = new Array< Vector >;

        for( let i = 0 ; i < step ; ++i ){
            edge.push( new Vector( Math.cos( i * stride ) , Math.sin( i * stride ) ).applyTransform( mat ) );
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

    getPoints() : Array< Vector > {
        
        let hw : number = this.width / 2;
        let hh : number = this.height / 2;
        
        return [
            new Vector( -hw , -hh ),
            new Vector(  hw , -hh ),
            new Vector(  hw ,  hh ),
            new Vector( -hw ,  hh ),
        ];

    };

}

class Polygon extends Shape{
    
    public points : Array<Vector>;

    public get shapeType() { return ShapeType.POLYGON; }

    constructor( points : Array<Vector>){
        super();
        this.points = points;
    }

    append( vertex : Vector ){

        this.points.push( vertex );

    }

    getPoints() : Array< Vector > {
        return this.points;
    };


}

class Convex extends Polygon{

    constructor( points : Array<Vector> ){
        points = Tool.GetConvex( points );
        super( points );
    }


}

class QuadraticBezierCurve extends Path{

    public p0 : Vector;
    public p1 : Vector;
    public p2 : Vector;

    constructor( p0 : Vector , p1 : Vector , p2 : Vector ){
        super();
        this.p0 = p0 ;
        this.p1 = p1 ;
        this.p2 = p2 ;
    }

    getPoints() : Array< Vector > {
        return new Array< Vector > ();
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