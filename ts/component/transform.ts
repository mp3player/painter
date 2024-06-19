import { Component } from "./component.js";
import { Matrix3 } from "../matrix.js";
import { Vector3 } from "../vector.js";


class TransformComponent extends Component {

    public rotation : number = 0.0;
    public scale : Vector3 = new Vector3( 1.0 , 1.0 );
    public center : Vector3 = new Vector3( 0.0 , 0.0 );

    // matrix only for local transformation and inverse transformation
    public transformShape : Matrix3 = new Matrix3;
    public inverseTransformShape : Matrix3 = new Matrix3;

    // matrix only for world transformation and inverse transformation
    public transformWorld : Matrix3 = new Matrix3;
    public inverseTransformWorld : Matrix3 = new Matrix3;

    //matrix for Local & World transformation and inverse transformation
    public transformShapeWorld : Matrix3 = new Matrix3;
    public inverseTransformShapeWorld : Matrix3 = new Matrix3;

    // indicate whether the matrix needed to be updated
    private transformShapeNeedUpdate : boolean = true ;
    private transformWorldNeedUpdate : boolean = true;
    
    public updateOnce( deltaTime: number ): void {

        if( this.transformShapeNeedUpdate == true ){
            // debugger
            // update Local Transform
            this.updateTransformShape();
            this.transformShapeNeedUpdate = false;
            // if Local Transform has updated => the WorldShape Transform must be updated
            this.transformWorldNeedUpdate = true;
            this._needUpdate = true;

        }else{
            this._needUpdate = false;
        }

        if( this.transformWorldNeedUpdate == true ){

            // update World Transform
            this.updateTransformShapeWorld();
            this.transformWorldNeedUpdate = false;
            this._needUpdate = true;

        }else{
            this._needUpdate = false;
        }
    }

    // update Local Transform according the translation, scale and rotation
    private updateTransformShape() : void {

        this.transformShape = new Matrix3();
        this.transformShape = Matrix3.Rotate(this.transformShape , this.rotation);
        this.transformShape = Matrix3.Scale(this.transformShape , this.scale);
        this.transformShape = Matrix3.Translate( this.transformShape , this.center );

        this.inverseTransformShape = this.transformShape.inverse();

    }

    // update the global transformation by given transform 
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

    // update local & world transformation by current local transformation and world transformation
    public updateTransformShapeWorld( ) : void {

        this.transformShapeWorld = Matrix3.Multiply( this.transformWorld , this.transformShape );
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
            this.center = new Vector3( x , y ); 
            this.transformShapeNeedUpdate = true; 
        }
         
    }

    public setScale( x : number , y : number ) : void { 
        if( this.scale.x != x || this.scale.y != y ){
            this.scale = new Vector3( x , y ); 
            this.transformShapeNeedUpdate = true; 
        }  
    }

    public rotate( r : number ) : void { 
        if( r != 0 ){
            this.rotation += r; 
            this.transformShapeNeedUpdate = true; 
        }
    }

    public translate( translation : Vector3 ) : void { 
        if( translation.x != 0 || translation.y != 0 ){
            this.center = Vector3.Addition( this.center , translation );
            this.transformShapeNeedUpdate = true; 
        }
        
    }

};

export { TransformComponent }