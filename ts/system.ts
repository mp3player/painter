import { Buffer } from "./buffer.js";
import { ArrayList, PriorityQueue } from "./collection.js";
import { BoxComponent, ShapeComponent, TransformComponent } from "./component.js";
import { Entity } from "./entity.js";
import { Painter } from "./painter.js";
import { Renderer, RendererComponent } from "./render.js";
import { Arc, Circle, Ellipse, Path, Polygon, Rectangle, Shape, ShapeType, Text } from "./shape.js";
import { Color, Style } from "./style.js";
import { BorderBox } from "./util.js";
import { Matrix, Vector } from "./vector.js";




abstract class SystemBase {

    protected name : string ;

    protected scene : Painter ;

    constructor( scene : Painter , name : string = 'system' ){
        this.scene = scene;
        this.name = name;
    }

    public init() : void {}
    
    public abstract update( deltaTime : number ) : void ;

}

class TransformSystem extends SystemBase {

    public constructor( scene : Painter , name : string = 'transform' ){
        super( scene , name );
    }

    // override SystemBase.update
    // update transform component
    public update( deltaTime : number ) : void {

        let callback : Function = ( node : Entity ) => {

            let worldTransform : TransformComponent = null;
            if( node.hasComponent('transform') ){
                worldTransform = node.findComponent( 'transform' );
                worldTransform.update( deltaTime );
                
            }
            
            let list : ArrayList< Entity > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                
                let shape : Entity = list.get( i );
                if( shape.hasComponent('transform') ){
                    let transform : TransformComponent = shape.findComponent( 'transform' );
                    
                    if( worldTransform != null && worldTransform.hasUpdated ){
                        transform.updateTransformWorld( worldTransform );
                    }

                    callback( shape );
                }
                
            }

        }

        callback( this.scene );
        
    }

}



export { SystemBase , TransformSystem  }