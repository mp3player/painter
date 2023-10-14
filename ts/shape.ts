import { ArrayList } from "./collection.js";
import { Box, Tool } from "./util.js";
import { Matrix, Vector } from "./vector.js";
import { Style } from './style.js'
import { EventListener } from "./event.js";
import { Component, TransformComponent } from './component.js'
import { ShapeRendererComponent } from "./component.js";

enum ShapeType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT };

class Shape extends EventListener {

    public style : Style;

    public box : Box;
    public children : ArrayList<Shape>;
    public components : Map< string ,Component > = new Map< string , Component >();
    public transform : TransformComponent = new TransformComponent( 'transform' );
    
    public name : string;
    public visible : boolean;
    public parent : Shape;
    public dragable: boolean;

    protected _index : number;
    protected _shapeNeedUpdate : boolean;
    protected _uuid : string;

    public set index( _index : number ) {
        this._index = _index;
        this._shapeNeedUpdate = true;
    }

    public get index( ) { return this._index ;}

    public get shapeNeedUpdate(){ return this._shapeNeedUpdate ; }

    public get uuid() { return this._uuid ; };

    public get shapeType() { return ShapeType.SHAPE; }

    constructor( x = 0 , y = 0 ){
        super();
        this.style = new Style();

        // whether the shape need to be updated , including : shape data
        this._shapeNeedUpdate = false;
        // whether the shape need to be updated , including : transform matirx

        this.box = new Box();

        this.children = new ArrayList();

        this._uuid = Tool.UUID();

        this.name = '';

        this.index = 0;

        this.visible = true;
        this.dragable = true;

        this.addComponent( this.transform );
        this.addComponent( new ShapeRendererComponent( 'renderer' ) );

    }

    setStyle( style : Style ) : void {
        this.style = style;
    }

    add(shape : Shape) : void { 

        this.children.add(shape);
        shape.parent = this;

    }

    remove( uuid : string ) : Shape | null {
        for( let i = 0 ; i < this.children.length ; ++ i ){
            if( this.children.get(i).uuid == uuid ){
                return this.children.remove( i );
            }
        }
        return null;
    }

    // TODO : add traverse finding
    getShapeByID( uuid : string ) : Shape | null {
        for(let i = 0 ; i < this.children.length ; ++ i){
            if(this.children.get(i).uuid == uuid)
                return this.children.get(i);
        }
        return null;
    }

    // component related
    addComponent( component : Component ) : void {

        this.components.set( component.name , component );
        component.shape = this;
        
    }

    hasComponent( name : string ) : boolean {

        return this.components.has( name );

    }

    findComponent( name : string ) : Component | any {
        
        if( this.hasComponent( name ) ){
            return this.components.get( name );
        }
        return null;

    }

    removeComponent( name : string ) : boolean {

        if( this.hasComponent( name ) ) {
            return this.components.delete( name );
        }
        return false;

    }

    // depth first traverse
    traverse( callback = ( d : Shape ) => {} ) : void {
        
        this.children.forEach( (d : Shape) => {
            callback( d );
            d.traverse( callback );
        })
    }

    // this should be overrided according the shape 
    clone() : Shape {
        
        let shape = new Shape();
        // TODO : clone the properties of the shape
        
        // clone children
        for( let i = 0 ; i < this.children.length ; ++ i){
            shape.add( this.children.get(i).clone() );
        }
        return shape;

    }



}

class Path extends Shape {

    public points : Array<Vector>;

    public get shapeType() { return ShapeType.PATH; }

    constructor(x = 0 , y = 0 ){
        super( x , y );
        this.points = new Array<Vector>();
    }

    append( point : Vector ){
        this.points.push( point );
        this.box.append( point );
        this._shapeNeedUpdate = true;
    }

}

class Arc extends Shape {
    
    public from : number;
    public to : number; 
    public radius : number; 
    public startAngle : number ;
    public endAngle : number;

    public get shapeType() { return ShapeType.ARC; }

    constructor( startAngle : number = 0.0 , endAngle : number = 100.0 , radius : number = 100 , x = 0 , y = 0){
        super(x,y);

        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.radius = radius;
        
    }

}

class Circle extends Arc{

    public get shapeType() { return ShapeType.CIRCLE; }

    constructor( r = 1 ,  x = 0 , y = 0 ){
        super(0 , 360 , r , x , y);
    }


}

class Ellipse extends Shape {

    public a : number;
    public b : number;

    public get shapeType() { return ShapeType.ELLIPSE; }

    constructor( a = 1 , b = 1 , x = 0 , y = 0 ){
        super( x , y );
        this.a = a;
        this.b = b;
    }


};

class Rectangle extends Shape{

    public width : number;
    public height : number;

    public get shapeType() { return ShapeType.RECTANGLE; }

    constructor( width : number , height : number , x = 0 , y = 0 ){
        super(x,y);
        this.width = width;
        this.height = height;
    }


}

class Polygon extends Shape{
    
    public vertexes : Array<Vector>;

    public get shapeType() { return ShapeType.POLYGON; }

    constructor( vertexes : Array<Vector> , x = 0 , y = 0 ){
        super(x , y);
        this.vertexes = vertexes;
    }

    append( vertex : Vector ){

        this.vertexes.push( vertex );
        this._shapeNeedUpdate = true;

    }


}

class Convex extends Polygon{

    constructor(vertexes : Array<Vector> , x : number , y : number ){
        vertexes = Tool.GetConvex(vertexes);
        super(vertexes , x,y);
    }

}

class QuadraticBezierCurve extends Path{

    public p0 : Vector;
    public p1 : Vector;
    public p2 : Vector;

    constructor( p0 : Vector , p1 : Vector , p2 : Vector , x = 0 , y = 0 ){
        super(x , y);
        this.p0 = p0 ;
        this.p1 = p1 ;
        this.p2 = p2 ;
    }


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
        this._shapeNeedUpdate = true;
    }

    public set baseline( _baseline : string ) { 
        this._baseline = _baseline ;
    }

    public set family( family : string ) { 
        this._family = family;
        this._shapeNeedUpdate = true;
    }




    
    constructor( text : string , x : number = 0 , y : number = 0 ){
        super( x , y );
        this.text = text;
        this.fontSize = 10;
    }

}


export { Shape , Path , Arc , Circle , Ellipse , Rectangle , Polygon , Convex , QuadraticBezierCurve , ShapeType ,Text }