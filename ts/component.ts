import { Shape } from './shape.js'
import { Style } from './style.js';
import { Matrix, Vector } from './vector.js';



abstract class Component {

    public _shape : Shape | null;
    protected _name : string 

    public get name(){
        return this._name;
    }

    public set shape( shape : Shape ){
        this._shape = shape;
    }

    public get shape( ){
        return this._shape;
    }

    constructor( name : string = "Default Component" ){
        this._name = name;
        this._shape = null;
    }

    public abstract update( deltaTime : number ) : void ;

};

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


abstract class Renderer extends Component {
    
    private style : Style ;
    private needUpdate : boolean = true ;

    constructor( name : string = "Default CanvasRender" ){
        super( name );
    }
    
    // TODO : implementation Component::update  
    abstract update( deltaTime : number ) : void ;

    // TODO : implement Renderer::render
    public abstract render( ): void;
}

class ShapeRendererComponent extends Renderer {

    constructor( name : string = "Default ShapeRendererComponent" ){
        super( name );
    }

    public update( deltaTime : number ) : void {

    }

    public render( ) : void {

    }


}

class BorderBoxRendererComponent extends Renderer {

    constructor( name : string = "Default BorderBoxComponent" ){
        super( name );
    }

    // TODO : override 
    // [ render | process ] the box of the shape this component attached to
    public update( deltaTime : number ) : void { }

    public render(): void { }

}

class BorderCircleRendererComponent extends Renderer {

    constructor( name : string = "Default BorderCircleComponent" ){
        super( name );
    }

    public update( deltaTime : number ) : void {}

    public render() : void { }

}


export { Component , TransformComponent , ShapeRendererComponent , BorderBoxRendererComponent , BorderCircleRendererComponent }