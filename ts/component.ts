import { Shape } from './shape.js'
import { Matrix, Vector } from './vector.js';



abstract class Component {

    protected shape : Shape;
    protected _name : string 

    public get name(){
        return this._name;
    }

    constructor( name : string = "Default Component" ){
        this._name = name;
    }

    public setShape( shape : Shape ) : void {
        this.shape = shape;
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

    private needUpdate : boolean = true;
    
    public update(deltaTime: number): void {

        if( this.needUpdate ){
            // update Local Transform
            this.updateTransformShape();
            // update World Transform
            this.updateTransformShapeWorld();
        }

    }

    // Local Transform
    private updateTransformShape() : void {

        this.transformShape = new Matrix();
        this.transformShape = Matrix.rotate(this.transformShape , this.rotation);
        this.transformShape = Matrix.scale(this.transformShape , this.scale);
        this.transformShape = Matrix.translate( this.transformShape , this.center );

        this.inverseTransformShape = this.transformShape.inverse();

    }

    // update manully
    public forceUpdateTransformShape() : void {

        this.updateTransformShape();

    }

    // Parent Transform
    public updateTransformWorld( transformWorld : Matrix , inverseTransformWorld : Matrix ) : void {
        
        this.transformWorld = transformWorld.clone();
        this.inverseTransformWorld = inverseTransformWorld;
        this.needUpdate = true;

    }

    // World Transform
    public updateTransformShapeWorld( ) : void {

        this.transformShapeWorld = Matrix.multiply( this.transformWorld , this.transformShape );
        this.inverseTransformShapeWorld = this.transformShapeWorld.inverse();

    }
    
    public setRotation( rotation : number ) : void { this.rotation = rotation; }

    public setTranslation( x : number , y : number ) : void { this.center = new Vector( x , y );  }

    public setScale( x : number , y : number ) : void { this.scale = new Vector( x , y ); }

    public rotate( r : number ) : void { this.rotation += r; }

    public translate( translation : Vector ) : void { this.center = Vector.addition( this.center , translation ); }

};



export { Component , TransformComponent }