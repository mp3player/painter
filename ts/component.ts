import { Entity } from './entity.js';
import { Circle, Shape } from './shape.js'
import { Style } from './style.js';
import { BorderBox, BorderCircle } from './util.js';
import { Matrix, Vector } from './vector.js';


abstract class Component {

    public _entity : Entity | null;
    protected _name : string 

    public get name(){
        return this._name;
    }

    public set entity( shape : Entity ){
        this._entity = shape;
    }

    public get entity( ){
        return this._entity;
    }

    constructor( name : string = "Default Component" ){
        this._name = name;
        this._entity = null;
    }

    public abstract update( deltaTime : number ) : void ;

};

class ShapeComponent extends Component {

    public shape : Shape;
    private points : Array< Vector > = new Array< Vector >; 
    public hasUpdated : boolean = true;

    public constructor( shape : Shape , name : string = "shape" ){
        super( name );
        this.shape = shape;
    }

    public update( deltaTime: number ): void {

        if( this.hasUpdated ){

            this.points = this.shape.getPoints();

            this.hasUpdated = false;

        }

    }

    public getPoints() : Array< Vector > {

        return this.shape.getPoints();

    }

}

class TransformComponent extends Component {

    public rotation : number = 0.0;
    public scale : Vector = new Vector( 1.0 , 1.0 );
    public center : Vector = new Vector( 0.0 , 0.0 );

    public transformShape : Matrix = new Matrix;
    public inverseTransformShape : Matrix = new Matrix;

    public transformWorld : Matrix = new Matrix;
    public inverseTransformWorld : Matrix = new Matrix;

    public transformShapeWorld : Matrix = new Matrix;
    public inverseTransformShapeWorld : Matrix = new Matrix;

    private transformShapeNeedUpdate : boolean = true ;
    private transformWorldNeedUpdate : boolean = true;
    public hasUpdated : boolean = false;
    
    public update( deltaTime: number ): void {

        if( this.transformShapeNeedUpdate == true ){
            // debugger
            // update Local Transform
            this.updateTransformShape();
            this.transformShapeNeedUpdate = false;
            // if Loca Transform has updated => the WorldShape Transform must be updated
            this.transformWorldNeedUpdate = true;
            this.hasUpdated = true;

        }else{
            this.hasUpdated = false;
        }

        if( this.transformWorldNeedUpdate == true ){

            // update World Transform
            this.updateTransformShapeWorld();
            this.transformWorldNeedUpdate = false;
            this.hasUpdated = true;

        }else{
            this.hasUpdated = false;
        }

    }

    // Local Transform
    private updateTransformShape() : void {

        this.transformShape = new Matrix();
        this.transformShape = Matrix.Rotate(this.transformShape , this.rotation);
        this.transformShape = Matrix.Scale(this.transformShape , this.scale);
        this.transformShape = Matrix.Translate( this.transformShape , this.center );

        this.inverseTransformShape = this.transformShape.inverse();
        
    }

    // Parent Transform
    public updateTransformWorld( worldTransform : TransformComponent ) : void {

        this.transformWorld = worldTransform.transformShapeWorld.clone();
        this.inverseTransformWorld = worldTransform.inverseTransformShapeWorld.clone();

        // TODO : check wheter the updated value are same as the original to decrease compucation cost
        
        this.transformWorldNeedUpdate = true;

    }

    // update manully
    public forceUpdateTransformShape() : void {

        this.updateTransformShape();

    }

    // World Transform
    public updateTransformShapeWorld( ) : void {

        this.transformShapeWorld = Matrix.Multiply( this.transformWorld , this.transformShape );
        this.inverseTransformShapeWorld = this.transformShapeWorld.inverse();

    }
    
    public setRotation( rotation : number ) : void { 
        if( this.rotation != rotation ){
            this.rotation = rotation; 
            this.transformShapeNeedUpdate = true 
        }
        
    }

    public setTranslation( x : number , y : number ) : void { 
        if( this.center.x != x || this.center.y != y ){
            this.center = new Vector( x , y ); 
            this.transformShapeNeedUpdate = true; 
        }
         
    }

    public setScale( x : number , y : number ) : void { 
        if( this.scale.x != x || this.scale.y != y ){
            this.scale = new Vector( x , y ); 
            this.transformShapeNeedUpdate = true; 
        }  
    }

    public rotate( r : number ) : void { 
        if( r != 0 ){
            this.rotation += r; 
            this.transformShapeNeedUpdate = true; 
        }
        
    }

    public translate( translation : Vector ) : void { 
        if( translation.x != 0 || translation.y != 0 ){
            this.center = Vector.Addition( this.center , translation );
            this.transformShapeNeedUpdate = true; 
        }
        
    }

};

class BoxComponent extends Component {

    public borderBox : BorderBox;
    public transform : Matrix;
    public visible : boolean = true;
    public dash : number = 4;

    constructor( name : string = "Default BorderBoxComponent" ){
        super( name );
        this.borderBox = new BorderBox();
    }

    // TODO : override 
    // [ render | process ] the box of the shape this component attached to
    public update( deltaTime : number ) : void {
        
        // prepare cache

        // update the border of shape 
        let transformComponent : TransformComponent = this.entity.findComponent( 'transform' );
        let shapeComponent : ShapeComponent = this.entity.findComponent('shape');

        // recompute the border
        let points : Array< Vector > = shapeComponent.getPoints();

        this.borderBox.reset();
        for( let i = 0 ; i < points.length ; ++ i ){
            this.borderBox.merge( points.at( i ) );
        }

        if( transformComponent.hasUpdated ){
            this.transform = transformComponent.transformShapeWorld.clone();
        }

    }

}

class CircleComponent extends BoxComponent {

    public borderCircle : BorderCircle;

    constructor( name : string = "Default BorderCircleComponent" ){
        super( name );
    }

    public update( deltaTime : number ) : void {
        super.update( deltaTime );

        let radius = this.borderBox.right - this.borderBox.left;
        if( this.borderBox.top - this.borderBox.bottom > radius ) radius = this.borderBox.top - this.borderBox.bottom;
        let center = new Vector( ( this.borderBox.left + this.borderBox.right ) / 2 , ( this.borderBox.top + this.borderBox.bottom ) / 2 );
        this.borderCircle = new BorderCircle( center , radius / 2 );

    }

}

export { Component , ShapeComponent , TransformComponent ,  BoxComponent , CircleComponent }