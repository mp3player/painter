import { Arc, Circle , Polygon, Rectangle, Shape , ShapeType, Text } from "./shape.js";
import { Color } from "./style.js";
import { Matrix, Vector } from "./vector.js";
import { Tool } from "./util.js";
import { PriorityQueue } from "./collection.js";

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


class Painter extends Shape{

    public canvas : HTMLCanvasElement | null | undefined ;
    public width : number ;
    public height : number;
    public background : Color;
    public resizable : boolean;
    public zoomable : boolean;
    private _transformScreen : Matrix;           // coord => screen
    private _inverseTransformScreen : Matrix;    // screen => coord 

    private queue : PriorityQueue<Shape> = new PriorityQueue<Shape>;

    public get transformScreen(){
        return this._transformScreen.clone();
    }

    public get inverseTransformScreen(){
        return this._inverseTransformScreen.clone();
    }

    constructor(
        width : number = innerWidth  , 
        height : number = innerHeight 
    ){
        super(0,0);
        
        this.width = width;
        this.height = height;
        this.background = Color.White;
        this.resizable = true;
        this.zoomable = true;
        this.index = -1;
        this._transformScreen = new Matrix();
        this._inverseTransformScreen = new Matrix();
        this.updateTransformPainter();
    }

    saveImage( x : number = 0 , y : number = 0 , width : number = innerWidth , height : number = innerHeight , fileName : string = "save.jpg" ){
        
        
        
    }


    // update coordinateTransform
    updateTransformPainter() : void {

        // transform matrix apply to the painter
        let transform = new Matrix();

        transform = Matrix.Scale(transform , new Vector(1,-1));
        transform = Matrix.Translate(transform , new Vector(this.width / 2 , this.height / 2));
        this._transformScreen = transform;
        this._inverseTransformScreen = transform.inverse();

    }

    // override
    update( deltaTime : number ) : void {

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

export { Painter }