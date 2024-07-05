import { Buffer } from "../buffer.js";
import { ArrayList, PriorityQueue , _Comp } from "../container/collection.js";
import { RendererComponent } from "../component/render.js";
import { ShapeComponent } from "../component/shape.js";
import { TransformComponent } from "../component/transform.js";
import { Entity } from "../entity.js";
import { Matrix3 } from "../matrix.js";
import { CanvasPainter } from "../painter.js";
import { Vector3 } from "../vector.js";

// render buffer 
class TransformedShapeRenderedBuffer extends Buffer {

    private _data : Array< Vector3 > ;
    private _filled : boolean = true;
    private _ref : Entity ;

    public needUpdate : boolean = true ;

    public get data(){
        return this._data;
    }

    public get ref (){
        return this._ref;
    }

    public get filled(){
        return this._filled;
    }

    public set filled( _filled : boolean ){
        this._filled = _filled;
    }
    
    public constructor( data : Array< Vector3 > , ref : Entity ){
        super()
        this._data = data;
        this._ref = ref;
    }

    getBuffer() : Array< Vector3 > {
        return this.data;
    }

};



// according the index 
let _EntityCompartor : _Comp<Entity> = ( node0 : Entity , node1 : Entity ) => {
    if( node0.index > node1.index ) return 1;
    else if( node0.index == node1.index ) return 0;
    return -1;
}




let _TransformedShapeCompartor : _Comp< TransformedShapeRenderedBuffer > = ( node0 : TransformedShapeRenderedBuffer , node1 : TransformedShapeRenderedBuffer ) => {
    if( node0.ref.index < node1.ref.index ) return 1;
    else if( node0.ref.index == node1.ref.index ) return 0;
    return -1;
}



abstract class SystemBase {

    protected name : string ;
    protected scene : CanvasPainter ;

    constructor( scene : CanvasPainter , name : string = 'system' ){
        this.scene = scene;
        this.name = name;
    }

    public init() : void {}
    
    public update( deltaTime : number ) {}

    public static ClearRenderBuffer(){
        SystemBase.MapedRenderBuffer.clear();
        SystemBase.OrderedRenderBuffer.clear();
    }

    public static ClearList() : void {
        
        SystemBase.EntityMapedList.clear();
        SystemBase.EntityOrderedList.clear();

    }

    public static CreateRenderBuffer( node : Entity ) : boolean {

        let shapeComponent : ShapeComponent = node.findComponentByClass( ShapeComponent );
        let transformComponent : TransformComponent = node.findComponentByClass( TransformComponent );
        let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );

        if( !shapeComponent || !transformComponent ) return false;

        if( shapeComponent.needUpdate || transformComponent.needUpdate && SystemBase.MapedRenderBuffer.has( node.uuid ) ){
            // buffer correspoding this node need to update 
            // delete this buffer from the maped buffer 

            // TODO : delete the uuid from the map , but not delete this one from the PriorityQueue 
            // so if the map delete this node , it must be done that deleting the corresponding one from the queue

            SystemBase.MapedRenderBuffer.delete( node.uuid );

            shapeComponent.updateFix();
        }

        

        let points = shapeComponent.getPoints();
        let buffer : TransformedShapeRenderedBuffer = null;
        
        // has no 
        if( !SystemBase.MapedRenderBuffer.has( node.uuid ) ){

            buffer = new TransformedShapeRenderedBuffer( Matrix3.TransformSequence( transformComponent.transformShapeWorld, points ) , node );
            
            SystemBase.MapedRenderBuffer.set( node.uuid , buffer );

            if( renderComponent.style.background == null ) buffer.filled = false;

        }else{

            buffer  = SystemBase.MapedRenderBuffer.get( node.uuid );
            if( buffer.needUpdate ){

            }
        }

        return true;
    }

    // static
    public static CreateEntityList( painter : Entity ) : void {

        let process = ( node : Entity ) => {

            if( !SystemBase.EntityMapedList.has( node.uuid ) ){
                SystemBase.EntityOrderedList.push( node );
                SystemBase.EntityMapedList.set( node.uuid , node );
            }

            let list : ArrayList< Entity > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                let entity : Entity = list.get( i );
                process( entity );
            }
        }

        process( painter );

    }

    static EntityMapedList : Map< string , Entity > = new Map< string , Entity >
    static EntityOrderedList : PriorityQueue< Entity > = new PriorityQueue< Entity >( _EntityCompartor );
    static MapedRenderBuffer : Map< string , TransformedShapeRenderedBuffer > = new Map< string , TransformedShapeRenderedBuffer >;
    static OrderedRenderBuffer : PriorityQueue< TransformedShapeRenderedBuffer > = new PriorityQueue< TransformedShapeRenderedBuffer>( _TransformedShapeCompartor ) ;

}


export { SystemBase , TransformedShapeRenderedBuffer }