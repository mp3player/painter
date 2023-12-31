import { MouseEventType, MouseActiveEvent, ActiveEvent } from "./event.js";
import {  Arc, Circle , Rectangle, Shape , ShapeType } from "./shape.js";
import { Color, Style } from "./style.js";
import { Matrix, Vector } from "./vector.js";
import { Tool } from "./util.js";

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


let isTouch : Function;
let bufferShape : Function ;
let bufferChildren: Function;
let render : Function;
let drawArc : Function;
let drawRectange : Function;
let drawPolygon : Function;
let drawPath : Function;
let drawText : Function;
let invokeEvent : Function;


interface ShapeCache {
    ref : Shape ,
    type : ShapeType , 
    buffer : any
};

const FrontBuffer : Map< string , ShapeCache > = new Map< string , ShapeCache >();

const BackBuffer : Map< String , ShapeCache > = new Map< string , ShapeCache >();

// the OrderedBuffer should be a binary tree
const OrderedBuffer : Array< ShapeCache > = new Array< ShapeCache > ();

console.log( OrderedBuffer )


class Painter extends Shape{

    public canvas : HTMLCanvasElement | null | undefined ;
    public pen : CanvasRenderingContext2D | null | undefined;
    public width : number ;
    public height : number;
    public background : Color;
    public resizable : boolean;
    public zoomable : boolean;
    private _transformScreen : Matrix;           // coord => screen
    private _inverseTransformScreen : Matrix;    // screen => coord 

    public get transformScreen(){
        return this._transformScreen.clone();
    }

    public get inverseTransformScreen(){
        return this._inverseTransformScreen.clone();
    }

    constructor(
        canvas : HTMLCanvasElement | null | undefined,
        width : number = innerWidth, 
        height : number = innerHeight
    ){
        super(0,0);

        this.canvas = canvas;
        this.width = width;
        this.height = height;
        this.background = Color.White;
        this.resizable = true;
        this.zoomable = true;
        this.index = -1;
        this._transformScreen = new Matrix();
        this._inverseTransformScreen = new Matrix();
        this.init();
        this.updateTransformPainter();
    }

    init(){
        if( !this.canvas )
            this.canvas = document.createElement('canvas');
        this.canvas.width = innerWidth ; 
        this.canvas.height = innerHeight;
        
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.pen = this.canvas.getContext('2d');

        invokeEvent( this );
    }

    saveImage( x : number = 0 , y : number = 0 , width : number = innerWidth , height : number = innerHeight , fileName : string = "save.jpg" ){
        
        let data = this.pen.getImageData(x , y , width , height);
        
    }

    remove( uuid : string ) : Shape | null {
        // find 
        // remove 
        // update cache
        // return the shape removed
        return super.remove( uuid );
    }

    flush() : void{
        if( !this.pen ) return ;

        this.pen.save();

        this.pen.fillStyle = this.background.toString();
        this.pen.fillRect(0,0,this.width,this.height);
        this.pen.fill();
        this.pen.restore();
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
        this.update()


    }

    // override
    update(){

        this.updateTransformPainter()
        super.update();
        
    }

    render() : void {
        render( this );
    }

}

// convert all coordinate to painter space

isTouch = function( cache : ShapeCache , position : Vector ) : boolean {

    
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

    let shapeType = shape.getShapeType();
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
                buffer : { 
                    edge , _edge
                } , 
                ref : shape , 
                type : ShapeType.RECTANGLE 
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
                buffer : { 
                    center : shape.center , 
                    radius : shape.radius ,
                    startAngle : 0 , 
                    endAngle : Math.PI * 2 , 
                    edge 
                } , 
                ref : shape , 
                type : ShapeType.CIRCLE
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
                buffer : { 
                    edge , _edge 
                } , 
                ref : shape , 
                type :ShapeType.PATH 
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
                buffer : { 
                    edge , _edge 
                } , 
                ref : shape , 
                type : ShapeType.POLYGON 
            };

        }break;
        
        case ShapeType.SHAPE:{

            cache = { 
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

drawArc = function ( pen : CanvasRenderingContext2D , buffer : any , style : Style ) : void {

    if( buffer.edge.length <= 0 ) return ;

    pen.save();

    Style.setStyle( pen , style );

    pen.beginPath();

    pen.moveTo( buffer.edge[0].x , buffer.edge[0].y );
    for(let i = 0 ; i < buffer.edge.length ; ++ i){
        pen.lineTo( buffer.edge[i].x , buffer.edge[i].y );
    }
    // pen.arc( buffer.center.x , buffer.center.y , buffer.radius , buffer.startAngle , buffer.endAngle );

    Style.setRender( pen , style );


    pen.restore();

}

drawRectange = function( pen : CanvasRenderingContext2D , buffer : any , style : Style ) : void {

    pen.save();
    
    Style.setStyle(pen , style);
    
    pen.beginPath();
    pen.moveTo( buffer.edge[0].x , buffer.edge[0].y );
    for(let i = 0 ; i < buffer.edge.length ; ++ i){
        pen.lineTo( buffer.edge[i].x , buffer.edge[i].y );
    }
    pen.closePath();

    Style.setRender( pen , style );

    pen.restore();

}

drawPolygon = function( pen : CanvasRenderingContext2D , buffer : any, style : Style  ) : void {

    if( buffer.edge.length <= 0 ) return ;

    pen.save();
    
    Style.setStyle( pen , style );
    
    pen.beginPath();
    let start = buffer.edge[0]
    
    pen.moveTo(start.x,start.y);
    for(let i = 1 ; i < buffer.edge.length ; ++ i){
        let edge = buffer.edge[i]
        pen.lineTo( edge.x , edge.y );
    }
    pen.closePath();
    
    Style.setRender( pen , style);

    pen.restore();
}

drawPath = function( pen : CanvasRenderingContext2D , buffer : any , style : Style ) : void {

    if( buffer.edge.length <= 0) return ;

    pen.save();
    Style.setStyle(pen , style);
    pen.beginPath();
    
    
    let start = buffer.edge[0]

    pen.moveTo(start.x,start.y);
    for(let i = 1 ; i < buffer.edge.length ; ++ i){
        let edge = buffer.edge[i];
        pen.lineTo(edge.x , edge.y);
    }
    Style.setRender( pen , style);
    pen.restore();

}

drawText = function( pen : CanvasRenderingContext2D , buffer : any , style : Style ) : void {

    let center = buffer.center;
    // this.pen.font()
    pen.font = "bold 48px serif";
    // this.pen.textBaseline = 
    pen.fillText(buffer.text , 0,10  );
    pen.fill();
}

render = function( painter : Painter  ){
    
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
                drawArc( painter.pen , shapeBuffer.buffer , shapeBuffer.ref.style );
            }break;
            
            case ShapeType.CIRCLE : {
                drawArc( painter.pen , shapeBuffer.buffer , shapeBuffer.ref.style )
            }break;
            
            case ShapeType.RECTANGLE : {
                drawRectange( painter.pen , shapeBuffer.buffer , shapeBuffer.ref.style );
            }break;
            
            case ShapeType.POLYGON : {
                drawPolygon( painter.pen , shapeBuffer.buffer , shapeBuffer.ref.style );
            }break;

            case ShapeType.PATH : {
                drawPath( painter.pen , shapeBuffer.buffer , shapeBuffer.ref.style );
            }

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

        let event : ActiveEvent = null;

        action.screen = new Vector( e.x , e.y );
        action.location = painter.convertToPainter( action.screen );
        action.drag.current = action.screen;
        action.target = this;

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
                event = new MouseActiveEvent( e , MouseEventType.MOUSEDOWN , action.location );
                event.target = topTarget;
                target.trigger( name , event );
                break;
            }
        }

        // default function
        if( name == 'mousedown' ){
            
            action.drag.target = event.target;

        }else if( name == 'mousemove' ){

            if( action.drag.target != fake ){

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

export {Painter}