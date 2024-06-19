import { ArrayList } from "../collection.js";
import { TransformComponent } from "../component/transform.js";
import { Entity } from "../entity.js";
import { CanvasPainter } from "../painter.js";
import { SystemBase } from "./system.js";

class TransformSystem extends SystemBase {

    public constructor( scene : CanvasPainter , name : string = 'transform' ){
        super( scene , name );
    }

    // override SystemBase.update
    // update transform component
    public update( deltaTime : number ) : void {

        // 1.update Painter world Transformation 
        

        // 2.update the transformation of the children attached to the painter

        let callback : Function = ( node : Entity ) => {

            let worldTransform : TransformComponent =  node.findComponentByClass( TransformComponent );
            if( worldTransform ){
                worldTransform.update( deltaTime );
            }
            
            let list : ArrayList< Entity > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                
                let shape : Entity = list.get( i );
                if( shape.findComponentByClass( TransformComponent ) ){
                    let transform : TransformComponent = shape.findComponentByClass( TransformComponent );
                    
                    if( worldTransform != null && worldTransform.needUpdate ){
                        // update transform 
                        transform.updateTransformWorld( worldTransform );
                    }

                    callback( shape );
                }
                
            }

        }

        callback( this.scene );
    }

}


export { TransformSystem }