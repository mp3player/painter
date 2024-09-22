import { Buffer } from "../buffer/buffer.js";
import { ArrayList, PriorityQueue , _Comp } from "../container/list/collection.js";
import { RendererComponent } from "../component/render/render.js";
import { GeometryComponent } from "../component/shapes/shape.js";
import { TransformComponent } from "../component/transform.js";
import { Entity } from "../entity.js";
import { Matrix3 } from "../math/matrix.js";
import { CanvasPainter } from "../painter.js";
import { Vector3 } from "../math/vector.js";
import { Geometry, GeometryType } from "../geometry/geometry.js";
import { GMath } from "../math/math.js";


// this is the container of render buffer 
class TransformedShapeRenderedBuffer extends Buffer {

    private _data : Array< Vector3 > ;
    private _filled : boolean = true;
    private _ref : Entity ;
    private _shape : Geometry

    public needUpdate : boolean = true ;

    public get data(){
        return this._data;
    }

    public get ref (){
        return this._ref;
    }

    public get shape(){
        return this._shape;
    }

    public get filled(){
        return this._filled;
    }

    public set filled( _filled : boolean ){
        this._filled = _filled;
    }
    
    public constructor( data : Array< Vector3 > , ref : Entity , shape : Geometry ){
        super()
        this._data = data;
        this._ref = ref;
    }

    getBuffer() : Array< Vector3 > {
        return this.data;
    }

};



// this compartor is used to determine the processing order of the entity
let _EntityCompartor : _Comp<Entity> = ( node0 : Entity , node1 : Entity ) => {
    if( node0.index > node1.index ) return 1;
    else if( node0.index == node1.index ) return 0;
    return -1;
}



// this compartoer is used to determine the render order of the render buffer
let _TransformedShapeCompartor : _Comp< TransformedShapeRenderedBuffer > = ( node0 : TransformedShapeRenderedBuffer , node1 : TransformedShapeRenderedBuffer ) => {
    if( node0.ref.index < node1.ref.index ) return 1;
    else if( node0.ref.index == node1.ref.index ) return 0;
    return -1;
}

// 
function isPointInShape( shapeBuffer : TransformedShapeRenderedBuffer , point : Vector3  ) : boolean {
    return GMath.Geometry.IsPointInPolygon( shapeBuffer.data , point );
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

        let shapeComponent : GeometryComponent = node.findComponentByClass( GeometryComponent );
        let transformComponent : TransformComponent = node.findComponentByClass( TransformComponent );
        let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );

        if( !shapeComponent || !transformComponent ) return false;

        if( shapeComponent.needUpdate || transformComponent.needUpdate && SystemBase.MapedRenderBuffer.has( node.uuid ) ){
            // buffer correspoding this node need to update 
            // delete this buffer from the maped buffer 

            // TODO : delete the uuid from the map , but not delete this one from the PriorityQueue 
            // so if the map delete this node , it must be done that deleting the corresponding one from the queue

            SystemBase.MapedRenderBuffer.delete( node.uuid );

            shapeComponent.update( 0.0 );
        }

        

        let points = shapeComponent.getPoints();
        let buffer : TransformedShapeRenderedBuffer = null;
        
        // has no 
        if( !SystemBase.MapedRenderBuffer.has( node.uuid ) ){

            buffer = new TransformedShapeRenderedBuffer( Matrix3.TransformSequence( transformComponent.transformShapeWorld, points ) , node , shapeComponent.geometry );
            
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


export { SystemBase , TransformedShapeRenderedBuffer , isPointInShape }