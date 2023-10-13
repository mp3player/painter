import { MouseActiveEvent, ActiveEvent, EventType } from "./event.js";
import { Arc, Circle , Polygon, Rectangle, Shape , ShapeType, Text } from "./shape.js";
import { Color, Style } from "./style.js";
import { Matrix, Vector } from "./vector.js";
import { Tool } from "./util.js";
import { CanvasRenderer } from "./renderer.js";

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


let isTouch : ( cache : ShapeCache , position : Vector ) => boolean;
let bufferShape : ( transform : Matrix , shape : any , painter : Painter ) => void ;
let bufferChildren: ( transform : Matrix , shape : Shape , painter : Painter ) => void;
let render : ( painter : Painter  ) => void;
let drawArc : ( renderer : CanvasRenderer , cache : ShapeCache , style : Style ) => void;
let drawRectange : ( renderer : CanvasRenderer  , cache : ShapeCache , style : Style ) => void ;
let drawPolygon : ( renderer : CanvasRenderer  , cache : ShapeCache, style : Style  ) => void;
let drawPath : ( renderer : CanvasRenderer  , cache : ShapeCache , style : Style ) => void;
let drawText : ( renderer : CanvasRenderer  , cache : ShapeCache , style : Style ) => void;
let renderBox : ( renderer : CanvasRenderer  ,  cache : ShapeCache ) => void;
let invokeEvent : ( painter : Painter ) => void;


const DashColor = 'rgba(0,0,0,.8)'
const DashWidth = 2;

interface ShapeCache {
    world : Matrix,
    ref : Shape | Rectangle | Arc | Circle | Polygon | Text ,
    type : ShapeType , 
    buffer : any
};

interface HelperCache {
    ref : Shape , 
    world : Matrix ,
};

const FrontBuffer : Map< string , ShapeCache > = new Map< string , ShapeCache >();

const BackBuffer : Map< String , ShapeCache > = new Map< string , ShapeCache >();

// the OrderedBuffer should be a binary tree
const OrderedBuffer : Array< ShapeCache > = new Array< ShapeCache > ();

class Painter extends Shape{

    public canvas : HTMLCanvasElement | null | undefined ;
    public width : number ;
    public height : number;
    public background : Color;
    public resizable : boolean;
    public zoomable : boolean;
    private _transformScreen : Matrix;           // coord => screen
    private _inverseTransformScreen : Matrix;    // screen => coord 
    public renderer : CanvasRenderer;

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
        this.renderer = new CanvasRenderer( );
        this.init();
        this.updateTransformPainter();
    }


    private init(){
        let canvas = document.createElement('canvas');
        let pen = canvas.getContext( '2d' );
        this.canvas = canvas;

        canvas.style.position = 'absolute';
        canvas.style.left = '0'
        canvas.style.top = '0'

        this.renderer.setContext( canvas , pen );
        this.renderer.resize( this.width , this.height );

        invokeEvent( this );

    }

    appendTo( id : string | HTMLElement ) : void {
        
        let element : any;
        
        if( id instanceof String ){
            element = document.querySelector( '#' + id );
        }else{
            element = id;
        }

        if( element ){
            element.appendChild( this.canvas );
        }

    }


    saveImage( x : number = 0 , y : number = 0 , width : number = innerWidth , height : number = innerHeight , fileName : string = "save.jpg" ){
        
        
        
    }

    add(shape : Shape) : void {

        super.add( shape );

    }

    remove( uuid : string ) : Shape | null {
        // find 
        // remove 
        // update cache
        // return the shape removed
        return super.remove( uuid );
    }

    flush() : void{
        this.renderer.flush( this.background );
    }

    // update coordinateTransform
    updateTransformPainter() : void {
        // transform matrix apply to the painter
        let transform = new Matrix();

        transform = Matrix.scale(transform , new Vector(1,-1));
        transform = Matrix.translate(transform , new Vector(this.width / 2 , this.height / 2));
        this._transformScreen = transform;
        this._inverseTransformScreen = transform.inverse();

    }

    convertToPainter( screen : Vector ) : Vector {

        return screen.clone().multiply( this.inverseTransformScreen ).multiply( this.inverseTransformShape );

    }

    convertToScreen( coord : Vector ) : Vector {

        return coord.clone().multiply( this.transformShape ).multiply( this.transformScreen )
    
    }

    resize( width : number , height : number ) : void {
        
        this.width = width;
        this.height = height;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.updateTransformPainter();

    }

    // override
    update( deltaTime : number ) : void {

        super.update( deltaTime );
        
    }

    render() : void {
        render( this );
        for( let i = 0 ; i < this.children.length ; ++ i ){
            let shape : Shape = this.children.get( i );
            // shape.update( )
            // console.log( shape )
        }
    }

}

// convert all coordinate to painter space

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


bufferShape = function( transform : Matrix , shape : any , painter : Painter ) : void {

    // edge is used for render( screen coordinate ) , _edge is used for touch checking( painter coordinate )
    if( !shape.visible ) return ;

    if( !shape.needUpdate && BackBuffer.has( shape.uuid ) )  {
        FrontBuffer.set( shape.uuid , BackBuffer.get( shape.uuid ) );
        return ;
    }

    BackBuffer.delete( shape.uuid );

    if( shape.needUpdate ) shape.update(); 

    let shapeType = shape.shapeType;
    let cache = null;

    switch ( shapeType ){

        case ShapeType.RECTANGLE : {

            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );
            let width = shape.width;
            let height = shape.height;

            let v0 = new Vector(-width / 2 ,  height / 2);
            let v1 = new Vector( width / 2 ,  height / 2);
            let v2 = new Vector( width / 2 , -height / 2);
            let v3 = new Vector(-width / 2 , -height / 2);

            v0 = v0.multiply( transformScreen );
            v1 = v1.multiply( transformScreen );
            v2 = v2.multiply( transformScreen );
            v3 = v3.multiply( transformScreen );

            let edge = [v0, v1, v2, v3]

            v0 = painter.convertToPainter( v0 );
            v1 = painter.convertToPainter( v1 );
            v2 = painter.convertToPainter( v2 );
            v3 = painter.convertToPainter( v3 );

            let _edge = [ 
                v0, v1, v2, v3
                // v0.multiply( painter.inverseTransformShape ), 
                // v1.multiply( painter.inverseTransformShape ), 
                // v2.multiply( painter.inverseTransformShape ), 
                // v3.multiply( painter.inverseTransformShape ) 
            ];

            cache = { 
                world : transformScreen ,
                buffer : { 
                    edge , _edge
                } , 
                ref : shape , 
                type : shapeType 
            };
    
        }break;

        /**
        case ShapeType.ARC : {

            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );

            let startAngle = shape.startAngle * Math.PI / 180;
            let endAngle = shape.endAngle * Math.PI / 180;

            let radius = (new Vector(0,shape.radius)).multiply( shape.transformShapeWorld ).length();

            let length = 2 * Math.PI * radius;
            let step = ( endAngle - startAngle ) / length;

            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();

            console.log( transformScreen )

            for( let i = startAngle ; i < endAngle ; i += step ){
                
                let x = Math.cos( i ) , y = Math.sin( i );
                let vert = new Vector( x , y ).multiply( transformScreen )
                edge.push( vert );

                _edge.push( vert.multiply( painter.inverseTransformShape ) );

            }
            
            cache = { 
                buffer : { 
                    center : shape.center , 
                    radius : radius ,
                    startAngle : startAngle , 
                    endAngle : endAngle , 
                    edge , _edge
                } , 
                ref : shape , 
                type : ShapeType.ARC
            };
       
        }break;
 */
        case ShapeType.CIRCLE : {
            
            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );

            let startAngle = shape.startAngle * Math.PI / 180;
            let endAngle = shape.endAngle * Math.PI / 180;

            let step = ( endAngle - startAngle ) / 100;

            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();


            for( let i = startAngle ; i < endAngle ; i += step ){
                
                let x = Math.cos( i ) , y = Math.sin( i );
                let vert = new Vector( x , y ).scale( shape.radius ).multiply( transformScreen )
                edge.push( vert );

            }
            
            cache = { 
                world : transformScreen ,
                buffer : { 
                    center : shape.center , 
                    radius : shape.radius ,
                    startAngle : 0 , 
                    endAngle : Math.PI * 2 , 
                    edge 
                } , 
                ref : shape , 
                type : shapeType
            };

        }break;

        case ShapeType.ELLIPSE : {

            let a = shape.a , b = shape.b;
            let mat = new Matrix( a, 0, 0, 0, b, 0, 0, 0, 1 );
            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );
            transformScreen = Matrix.multiply( transformScreen , mat );

            let startAngle = 0;
            let endAngle = Math.PI * 2;
            let step = ( endAngle - startAngle ) / 100;
            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();

            for( let i = startAngle ; i < endAngle ; i += step ){
                let x = Math.cos( i ) , y = Math.sin( i );
                let vert = new Vector( x , y ).multiply( transformScreen )
                edge.push( vert );
            }

            cache = { 
                world : transformScreen ,
                buffer : { 
                    a : shape.a ,
                    b : shape.b,
                    edge ,
                } , 
                ref : shape , 
                type : shapeType
            };

        }break;

        case ShapeType.PATH : {
            
            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );

            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();

            for(let i = 0 ; i < shape.points.length ; ++ i){
                let vert = shape.points[i]
                vert = vert.multiply( transformScreen );
                edge.push(vert);
                _edge.push( painter.convertToPainter( vert ) );
            }

            cache = { 
                world : transformScreen ,
                buffer : { 
                    edge , _edge 
                } , 
                ref : shape , 
                type : shapeType
            };

        }break;

        case ShapeType.POLYGON : {

            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );

            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();
            for(let i = 0 ; i < shape.vertexes.length ; ++ i){
                let vert = shape.vertexes[i]
                vert = vert.multiply( transformScreen );
                edge.push( vert );
                _edge.push( painter.convertToPainter( vert ) );
            }

            cache = { 
                world : transformScreen ,
                buffer : { 
                    edge , _edge 
                } , 
                ref : shape , 
                type : shapeType
            };

        }break;
        
        case ShapeType.TEXT : {
            let transformScreen = Matrix.multiply( transform , shape.transformShapeWorld );

            let font = 'bold ' + shape.size + 'px ' + shape.family;

            cache = {
                world : transformScreen ,
                buffer : {
                    text : shape.text , 
                    font ,
                    position : shape.center.multiply( transformScreen )
                },
                ref : shape ,
                type : shapeType
            }

        }break

        case ShapeType.SHAPE:{

            cache = { 
                world : new Matrix(),
                buffer : { 
                    edge : null 
                } , 
                ref : shape , 
                type : ShapeType.SHAPE 
            };

        }break;

    }

    FrontBuffer.set( shape.uuid , cache );

}

bufferChildren = function( transform : Matrix , shape : Shape , painter : Painter ) : void {

    bufferShape( transform , shape , painter );

    for( let i = 0 ; i < shape.children.length ; ++ i ){

        bufferShape( transform , shape.children.get(i) , painter );

        bufferChildren( transform , shape.children.get(i) , painter );

    }

}

drawArc = function ( renderer : CanvasRenderer , cache : ShapeCache , style : Style ) : void {
    
    let pen = renderer.pen;
    let buffer = cache.buffer;
    if( buffer.edge.length <= 0 ) return ;

    pen.save();

    renderer.setStyle( style );

    pen.beginPath();

    pen.moveTo( buffer.edge[0].x , buffer.edge[0].y );
    for(let i = 0 ; i < buffer.edge.length ; ++ i){
        pen.lineTo( buffer.edge[i].x , buffer.edge[i].y );
    }

    // pen.arc( buffer.center.x , buffer.center.y , buffer.radius , buffer.startAngle , buffer.endAngle );
    
    renderer.setRender( style );
    pen.restore();

    renderBox( renderer , cache );
}

drawRectange = function( renderer : CanvasRenderer , cache : ShapeCache , style : Style ) : void {

    let pen = renderer.pen;
    let buffer = cache.buffer;

    pen.save();
    
    renderer.setStyle(style);
    
    pen.beginPath();
    pen.moveTo( buffer.edge[0].x , buffer.edge[0].y );
    for(let i = 0 ; i < buffer.edge.length ; ++ i){
        pen.lineTo( buffer.edge[i].x , buffer.edge[i].y );
    }
    pen.closePath();

    renderer.setRender( style );

    pen.restore();

}

drawPolygon = function( renderer : CanvasRenderer , cache : ShapeCache, style : Style  ) : void {
    let pen = renderer.pen;
    let buffer = cache.buffer;
    if( buffer.edge.length <= 0 ) return ;

    pen.save();
    
    renderer.setStyle( style );
    
    pen.beginPath();
    let start = buffer.edge[0]
    
    pen.moveTo(start.x,start.y);
    for(let i = 1 ; i < buffer.edge.length ; ++ i){
        let edge = buffer.edge[i]
        pen.lineTo( edge.x , edge.y );
    }
    pen.closePath();
    
    renderer.setRender( style);

    pen.restore();

}

drawPath = function( renderer : CanvasRenderer , cache : ShapeCache , style : Style ) : void {

    let pen = renderer.pen;
    let buffer = cache.buffer;
    if( buffer.edge.length <= 0) return ;

    pen.save();
    renderer.setStyle( style );
    pen.beginPath();
    
    
    let start = buffer.edge[0]

    pen.moveTo(start.x,start.y);
    for(let i = 1 ; i < buffer.edge.length ; ++ i){
        let edge = buffer.edge[i];
        pen.lineTo(edge.x , edge.y);
    }
    renderer.setRender( style );
    pen.restore();

}

drawText = function( renderer : CanvasRenderer  , cache : ShapeCache , style : Style ) : void {
    let pen = renderer.pen;
    pen.save();
    pen.beginPath();
    let buffer = cache.buffer;
    let position = buffer.position;
    let font = cache.buffer.font;
    // this.pen.font()
    pen.font = font;
    // this.pen.textBaseline = 
    pen.fillText( buffer.text , position.x , position.y );
    pen.fill();
    pen.closePath();
    pen.restore();

}

renderBox = function(renderer : CanvasRenderer  ,  cache : ShapeCache ) : void {
    // console.log( cache )
    let pen = renderer.pen;
    let transform = cache.world;
    let box = cache.ref.box;
    
    let lt = new Vector( box.left , box.top ).multiply( transform );
    let rb = new Vector( box.right , box.bottom ).multiply( transform );

    let left = lt.x , top = lt.y;
    let right = rb.x , bottom = rb.y;

    pen.save();

    pen.beginPath();
    pen.strokeStyle = DashColor;
    pen.lineWidth = DashWidth;
    pen.setLineDash([5,5])
    pen.moveTo( left , top );
    pen.lineTo( right , top );
    pen.lineTo( right , bottom );
    pen.lineTo( left , bottom );
    pen.closePath();
    pen.stroke();

    pen.restore();

}

render = function( painter : Painter  ) : void {
    
    FrontBuffer.clear();
    OrderedBuffer.length = 0;
    bufferChildren( painter.transformScreen , painter , painter );
    
    FrontBuffer.forEach( ( value : ShapeCache , key : string ) => {
        BackBuffer.set( key , value );
        OrderedBuffer.push( value );
    } )
    
    OrderedBuffer.sort( ( a : ShapeCache  , b : ShapeCache ) : number => {
        return a.ref.index - b.ref.index;
    } )


    OrderedBuffer.forEach( ( d , i ) => {
        let shapeBuffer = d;
        switch( shapeBuffer.type ){
            
            case ShapeType.ARC : {
                drawArc( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }break;
            
            case ShapeType.CIRCLE : {
                drawArc( painter.renderer , shapeBuffer , shapeBuffer.ref.style )
            }break;
            
            case ShapeType.ELLIPSE : {
                drawPolygon( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }

            case ShapeType.RECTANGLE : {
                drawRectange( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }break;
            
            case ShapeType.POLYGON : {
                drawPolygon( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }break;

            case ShapeType.PATH : {
                drawPath( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }break;

            case ShapeType.TEXT : {
                drawText( painter.renderer , shapeBuffer , shapeBuffer.ref.style );
            }break;

        }
    } )

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

                let current = action.drag.current.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.inverseTransformWorld );
                let prev = action.drag.prev.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.inverseTransformWorld );
                
                let delta = current.sub( prev )
                action.drag.target.translate( delta );
            
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

export { Painter }