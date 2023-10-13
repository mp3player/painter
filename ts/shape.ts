import { ArrayList } from "./collection.js";
import { Box, Tool } from "./util.js";
import { Matrix, Vector } from "./vector.js";
import { Style } from './style.js'
import { EventListener } from "./event.js";
import { Component, TransformComponent } from './component.js'

enum ShapeType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT};

class Shape extends EventListener {
    
    public style : Style;
    public rotation : number;
    public scale : Vector;
    public center : Vector;
    public transformShape : Matrix;
    public inverseTransformShape : Matrix;
    public transformWorld : Matrix;
    public inverseTransformWorld : Matrix;
    public transformShapeWorld : Matrix;
    public inverseTransformShapeWorld : Matrix;
    public box : Box;
    public children : ArrayList<Shape>;
    public components : Map< string ,Component > = new Map< string , Component >();
    public transformComponent : TransformComponent = new TransformComponent;
    
    public name : string;
    public visible : boolean;
    public parent : Shape;
    public dragable: boolean;

    protected _index : number;
    protected _shapeNeedUpdate : boolean;
    protected _transformNeedUpdate : boolean;
    protected _uuid : string;

    public set index( _index : number ) {
        this._index = _index;
        this._shapeNeedUpdate = true;
    }

    public get index( ) { return this._index ;}

    public get shapeNeedUpdate(){ return this._shapeNeedUpdate ; }

    public get transformNeedUpdate(){ return this._transformNeedUpdate ; }

    public get uuid() { return this._uuid ; };

    public get needUpdate() { return this._shapeNeedUpdate || this._transformNeedUpdate ; }

    public get shapeType() { return ShapeType.SHAPE; }

    constructor( x = 0 , y = 0 ){
        super();
        this.style = new Style();

        // position properties
        this.rotation = 0;
        this.scale = new Vector(1,1);

        this.center = new Vector(x,y);
        
        // whether the shape need to be updated , including : shape data
        this._shapeNeedUpdate = false;
        // whether the shape need to be updated , including : transform matirx
        this._transformNeedUpdate = true;

        this.transformShape = new Matrix();
        this.inverseTransformShape = new Matrix();

        this.transformWorld = new Matrix();
        this.inverseTransformWorld = new Matrix();

        this.transformShapeWorld = new Matrix();
        this.inverseTransformShapeWorld = new Matrix();

        this.box = new Box();

        this.children = new ArrayList();

        this._uuid = Tool.UUID();

        this.name = '';

        this.index = 0;

        this.visible = true;
        this.dragable = true;

    }

    setStyle( style : Style ) : void {
        this.style = style;
    }

    setRotation( rotation : number ) : void {
        this.rotation = rotation;
        this._transformNeedUpdate = true;
    }

    setTranslation( x : number , y : number ) : void {
        this.center = new Vector( x , y );
        this._transformNeedUpdate = true;
    }

    setScale( x : number , y : number ) : void {
        this.scale = new Vector( x , y );
        this._transformNeedUpdate = true;
    }

    rotate( r : number ) : void {
        this.rotation += r;
        this._transformNeedUpdate = true;
    }

    translate( translation : Vector ) : void {
        this.center = Vector.addition( this.center , translation );
        this._transformNeedUpdate = true;
    }

    add(shape : Shape) : void { 
        this.children.add(shape);
        shape.parent = this;
        shape.updateTransformWorld( this.transformShapeWorld , this.inverseTransformShapeWorld );
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
        component.setShape( this );
        
    }

    hasComponent( name : string ) : boolean {

        return this.components.has( name );

    }

    findComponent( name : string ) : Component {
        
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

    // TODO : which is need to be overrieded according to the shape data  
    updateBox() : void {}

    // modelMatrix & inverse( modelMatrix )
    // update modelMatrix => update shapwWorldMatrix => update transform of children;
    updateTransformShape( ) : void {

        this.transformShape = new Matrix();

        this.transformShape = Matrix.rotate(this.transformShape , this.rotation);

        this.transformShape = Matrix.scale(this.transformShape , this.scale);

        this.transformShape = Matrix.translate( this.transformShape , this.center );


        this.inverseTransformShape = this.transformShape.inverse();

        this._transformNeedUpdate = false;

    }

    // TODO : thie method should be called by it's parent
    // worldMatrix & inverse( worldMatrix )
    // update worldMatrix => update shapwWorldMatrix => update transform of children;
    updateTransformWorld( transformWorld : Matrix , inverseTransformWorld : Matrix ) : void {

        this.transformWorld = transformWorld;
        this.inverseTransformWorld = inverseTransformWorld;

        this._transformNeedUpdate = true;

    }

    // TODO : this method should be called by it's parent
    // worldMatrix * modelMatirx & inverse( worldMatrix * modelMatrix )
    // compute shapeWorldMatrix => update transform of children
    updateTransformShapeWorld() : void {

        this.transformShapeWorld = Matrix.multiply( this.transformWorld , this.transformShape );
        this.inverseTransformShapeWorld = this.transformShapeWorld.inverse();

        for( let i = 0 ; i < this.children.length ; ++ i ){
            this.children.get( i ).updateTransformWorld( this.transformShapeWorld , this.inverseTransformShapeWorld );
        }
        
    }

    // this method will be called automatically when the status of the shape changed 
    update( deltaTime : number ) : void {
        
        // TODO : update transform ;
        // this section should place at TransformComponent
        this.updateTransformShape();
        this.updateTransformShapeWorld();
        this._transformNeedUpdate = false;

        // TODO : update shape status 
        this._shapeNeedUpdate = false;

        let iter = this.components.forEach( ( component : Component , name : String ) => {
            component.update( deltaTime );
        } )
        
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

    protected points : Array<Vector>;

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

    // override
    updateBox() : void { }

}

class Arc extends Shape {
    
    private from : number;
    private to : number; 
    private radius : number; 
    private startAngle : number ;
    private endAngle : number;

    public get shapeType() { return ShapeType.ARC; }

    constructor( startAngle : number = 0.0 , endAngle : number = 100.0 , radius : number = 100 , x = 0 , y = 0){
        super(x,y);

        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.radius = radius;

        this.updateBox();
        
    }

    // override
    updateBox(): void {
        
        let x = this.center.x ; 
        let y = this.center.y ; 
        let r = this.radius;

        this.box = new Box( y + r , x + r , y - r , x - r );

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

    updateBox() : void {
        super.updateBox();
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


    updateBox(): void {
        this.box.left = -this.width / 2;
        this.box.right = this.width / 2;
        this.box.top = this.height / 2;
        this.box.bottom = this.height / 2;
    }

}

class Polygon extends Shape{
    
    protected vertexes : Array<Vector>;

    public get shapeType() { return ShapeType.POLYGON; }

    constructor( vertexes : Array<Vector> , x = 0 , y = 0 ){
        super(x , y);
        this.vertexes = vertexes;
    }

    append( vertex : Vector ){

        this.vertexes.push( vertex );
        this._shapeNeedUpdate = true;

    }

    updateBox(): void {
        this.box.reset();
        for( let i = 0 ; i < this.vertexes.length ; ++ i ){
            this.box.append( this.vertexes[i] );
        }
    }

}

class Convex extends Polygon{
    constructor(vertexes : Array<Vector> , x : number , y : number ){
        vertexes = Tool.GetConvex(vertexes);
        super(vertexes , x,y);
    }
    updateBox(): void {
        this.box.reset();
        for( let i = 0 ; i < this.vertexes.length ; ++ i ){
            this.box.append( this.vertexes[i] );
        }
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

    updateBox(): void {
        
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

    public get fontFamily(){ return this._family; }

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

    public set fontFamily( family : string ) { 
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