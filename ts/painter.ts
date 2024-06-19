import { Grid } from "./component/grid.js";
import { TransformComponent } from "./component/transform.js";
import { Entity } from "./entity.js";
import { Matrix3 } from "./matrix.js";
import { Vector3 } from "./vector.js";

/**
 * render:
 * 1、transform the point to painter coordinate ( parent transform )
 * 2、transform the point from painter coordinate to screen ( coordinate Transform )
 * 
 * event 
 * 1、transform the mouse point from screen to painter coordinate ( 
 * 2、transform the 
 * 
 * order priority level
 *  index > natural order 
 * the painter should keep two cache 
 * 1、render cache : HashTable to index the value fast  
 * 2、array cache : event trigger to prevent the lower shape
 * 
 * the painter need to decorate the method in the tool to use the Shape class
 * 
 */


abstract class Painter extends Entity{

}
class CanvasPainter extends Painter{

    private _context : CanvasRenderingContext2D = null;

    constructor( _context : CanvasRenderingContext2D ){

        super()
        this._context = _context;

        this.transform.setTranslation( this.getContextWidth() / 2 , this.getContextHeight() / 2 )
        this.transform.setScale( 1 , -1 );
        this.transform.forceUpdateTransformShape();

        this.index = -1;

    }

    public getContextWidth() : number {
        return this._context ? this._context.canvas.width : 0 ;
    }

    public getContextHeight() : number {
        return this._context ? this._context.canvas.height : 0;
    }


}


// convert all coordinate to painter space
/**
 * 

isTouch = function( cache : ShapeCache , position : Vector ) : boolean {

    if( cache.type == ShapeType.ELLIPSE ) return false;

    if( cache.type == ShapeType.TEXT ) return false;
    
    if( cache.type == ShapeType.SHAPE ) return false; 

    if( cache.type == ShapeType.PATH ){
        return Tool.isPointInPath( cache.buffer._edge , position , 1 );
    }

    if( cache.type == ShapeType.CIRCLE ){
        return Tool.IsPointInCircle( cache.buffer.center , cache.buffer.radius , position );
    }

    return Tool.IsPointInPolygon( cache.buffer._edge , position );

}



invokeEvent = function( painter : Painter ) : void {

    const canvas = painter.canvas;

    const fake : Shape = new Shape();

    let action = {

        target : this , 
        mouseDown : false , 
        screen : new Vector ,
        location : new Vector ,

        drag : {
            target : fake , 
            current: new Vector,
            prev : new Vector
        }
        
    };

    
    // shape满足两个条件才会触发事件
    // 有该事件且touched
    // shape上层没有东西
    let eventHandler = ( name : string , e : MouseEvent ) => {

        let event : ActiveEvent = new MouseActiveEvent( e , name , action.location );;

        action.screen = new Vector( e.x , e.y );
        action.location = painter.convertToPainter( action.screen );
        action.drag.current = action.screen;
        action.target = painter;

        interface _Temp {
            index : number ,
            shape : Shape 
        };

        let path : Array< _Temp >  = new Array< _Temp >();

        // touch checking
        for( let i = OrderedBuffer.length - 1 ; i >= 0 ; --i ){
            let cache = OrderedBuffer[ i ];
            let touched = isTouch( cache , action.location );
            if( touched ){
                path.push( { index : cache.ref.index , shape : cache.ref } );
            }
        }

        path.push( { index : -1 , shape : painter } );

        if( path.length <= 0 ) return ;

        let top : _Temp = path[0];
        let topTarget : Shape = top.shape ;
        
        
        for( let i = 0 ; i < path.length ; ++ i ){
            
            top = path[i];
            let target = top.shape;
            if( target.hasEvent( name ) ){
                
                event.target = topTarget;
                target.trigger( name , event );
                break;

            }
        }

        // default function
        if( name == 'mousedown' ){

            action.mouseDown = true;
            action.drag.target = topTarget;

        }else if( name == 'mousemove' ){

            if( action.drag.target != null &&  action.drag.target != fake ){

                let current = action.drag.current.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.transform.inverseTransformWorld );
                let prev = action.drag.prev.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.transform.inverseTransformWorld );
                
                let delta = current.sub( prev );
                
                action.drag.target.transform.translate( delta );
            
            }

        }else if( name == 'mouseup' ){

            action.drag.target = fake;

        }

        action.drag.prev = action.drag.current;

    }

    window.addEventListener('resize' , ( e : Event ) =>{

        if( painter.resizable ){
            painter.resize( innerWidth , innerHeight );
        }

    })
    
    canvas?.addEventListener('mousedown' , (e : MouseEvent) => {
        
        eventHandler( 'mousedown' , e );
        eventHandler( 'dragstart' , e );

    });

    canvas?.addEventListener('mousemove' , (e : MouseEvent) => {

        eventHandler( 'mousemove' , e );
        eventHandler( 'drag' , e );

    })

    canvas?.addEventListener('mouseup' , (e : MouseEvent) => {

        eventHandler( 'mouseup' , e );
        eventHandler( 'drop' , e );

    })

    canvas?.addEventListener('contextmenu' , (e) => {
        e.preventDefault();
    })

    canvas?.addEventListener('keydown' , e => {
        return false;
    })

    canvas?.addEventListener('mousewheel' , ( e : WheelEvent ) => {


        eventHandler( 'mousewheel' , e );
    })

}

 */

export { CanvasPainter }