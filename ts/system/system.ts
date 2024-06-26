import { ArrayList, PriorityQueue } from "../collection.js";
import { Entity } from "../entity.js";
import { CanvasPainter } from "../painter.js";


abstract class SystemBase {

    protected name : string ;
    protected scene : CanvasPainter ;

    constructor( scene : CanvasPainter , name : string = 'system' ){
        this.scene = scene;
        this.name = name;
    }

    public init() : void {}
    
    public update( deltaTime : number ) {}


    public static ClearBuffer() : void {
        
        SystemBase.EntityMapBuffer.clear();
        SystemBase.EntityBuffer.clear();

    }

    // static
    public static CreateBuffer( painter : CanvasPainter ) : void {

        // this.queue.clear();

        let process = ( node : Entity ) => {

            if( !SystemBase.EntityMapBuffer.has( node.uuid ) ){
                SystemBase.EntityBuffer.push( node );
                SystemBase.EntityMapBuffer.set( node.uuid , node );
            }

            let list : ArrayList< Entity > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                let entity : Entity = list.get( i );
                process( entity );
            }
        }

        for( let i = 0 ; i < painter.children.length ; ++ i ){
            process( painter.children.get( i ) );
        }

    }

    static EntityMapBuffer : Map< string , Entity > = new Map< string , Entity >
    static EntityBuffer : PriorityQueue< Entity > = new PriorityQueue< Entity >;

}


export { SystemBase  }