import { ArrayList, PriorityQueue } from "./collection.js";
import { TransformComponent } from "./component.js";
import { Painter } from "./painter.js";
import { Arc, Circle, Ellipse, Path, Polygon, Rectangle, Shape, ShapeType, Text } from "./shape.js";
import { Color, Style } from "./style.js";
import { Matrix, Vector } from "./vector.js";



interface ShapeCache {
    ref : Shape | Rectangle | Arc | Circle | Polygon | Text ,
    type : ShapeType , 
    buffer : any
};

let bufferShape : ( shape : Shape ) => ShapeCache | null ;
let bufferChildren: ( transform : Matrix , shape : Shape , painter : Painter ) => void;
let drawArc : ( renderer : CanvasRenderSystem , cache : ShapeCache , style : Style ) => void;
let drawRectange : ( renderer : CanvasRenderSystem  , cache : ShapeCache , style : Style ) => void ;
let drawPolygon : ( renderer : CanvasRenderSystem  , cache : ShapeCache, style : Style  ) => void;
let drawPath : ( renderer : CanvasRenderSystem  , cache : ShapeCache , style : Style ) => void;
let drawText : ( renderer : CanvasRenderSystem  , cache : ShapeCache , style : Style ) => void;

abstract class SystemBase {

    protected name : string ;

    protected scene : Painter ;

    constructor( scene : Painter , name : string = 'system' ){
        this.scene = scene;
        this.name = name;
    }
    
    public abstract update( deltaTime : number ) : void ;

}

class TransformSystem extends SystemBase {

    public constructor( scene : Painter , name : string = 'transform' ){
        super( scene , name );
    }

    // override SystemBase.update
    // update transform component
    public update( deltaTime : number ) : void {

        let callback : Function = ( node : Shape ) => {
            
            let worldTransform : TransformComponent = null;
            if( node.hasComponent('transform') ){
                worldTransform = node.findComponent( 'transform' );
                worldTransform.update( deltaTime );
            }

            let list : ArrayList< Shape > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                let shape = list.get( i );
                if( shape.hasComponent('transform') ){
                    let transform : TransformComponent = shape.findComponent( 'transform' );
                    if( worldTransform != null && worldTransform.hasUpdated ){
                        transform.updateTransformWorld( worldTransform );
                        console.log( worldTransform )
                    }
                    transform.update( deltaTime );
                }
            }

        }

        callback( this.scene );
        
    }

}

class RenderSystem extends SystemBase {

    protected queue : PriorityQueue< Shape > = new PriorityQueue< Shape >;

    public constructor( scene : Painter , name : string = 'render' ) {
        super( scene , name );
    }

    update( deltaTime : number ) : void {
        // get all shape 

        this.queue.clear();
        let map : Map<string , boolean > = new Map<string , boolean>();

        let enQueue = ( node : Shape ) => {
            if( !map.has( node.uuid ) ){
                this.queue.push( node );
                map.set( node.uuid , true );
            }
            let list : ArrayList< Shape > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                let shape : Shape = list.get( i );
                enQueue( shape );
            }
        }

        for( let i = 0 ; i < this.scene.children.length ; ++ i ){
            enQueue( this.scene.children.get( i ) );
        }

    }
}

class CanvasRenderSystem extends RenderSystem {
    
    private canvas : HTMLCanvasElement | null ;
    private pen : CanvasRenderingContext2D | null ;

    private width : number = 0;
    private height : number = 0;

    private renderBuffer : Map< string , ShapeCache > = new Map< string , ShapeCache >;

    public constructor( scene : Painter , name : string = 'render' ) {
        super( scene , name );
        this.canvas = document.createElement( 'canvas') ;
        this.pen = this.canvas.getContext( '2d' );
        this.resize( innerWidth , innerHeight );
        this.init();
    }

    init() : void {
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = '0';
        this.canvas.style.top = '0';
    }

    public getCanvas() : HTMLCanvasElement | null {
        return this.canvas;
    }

    public getPen() : CanvasRenderingContext2D | null {
        return this.pen;
    }

    public resize( width : number , height : number ) : void {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;

        let transform : Matrix = new Matrix;
        transform = Matrix.Scale(transform , new Vector(1,-1));
        transform = Matrix.Translate(transform , new Vector(this.width / 2 , this.height / 2));

        let data = transform.data;

        this.pen.setTransform( data[0] , data[1] , data[3] , data[4] , data[6] , data[7] );
    }

    public flush( color : Color ) : void{
        if( !this.pen ) return ;

        this.pen.save();

        this.pen.fillStyle = color.toString()
        this.pen.fillRect( 0 , 0 , this.width , this.height );
        this.pen.fill();
        this.pen.restore();
    }

    // TODO : finish the correction
    public setStyle(  style : Style ) : void {
        let pen = this.pen;
        if( style.background ) pen.fillStyle = style.background.toString();
        if( style.color ) pen.strokeStyle = style.color.toString();
        pen.lineWidth = style.lineWidth;
        pen.lineJoin = 'round';
        pen.lineCap = 'round';
        pen.globalAlpha = style.opacity;
    }

    private stroke( ) : void {
        this.pen.stroke();
    }

    private fill( ) : void {
        this.pen.fill();
    }

    private moveTo( point : Vector ) : void {
        this.pen.moveTo( point.x , point.y );
    }

    private lineTo( point : Vector ) : void {
        this.pen.lineTo( point.x , point.y );
    }

    public setRender( style : Style ) : void {
        if(style.background != null)
            this.fill();
        
        if(style.lineWidth > 0)
            this.stroke( );
    }

    private save() : void {
        this.pen.save();
    }

    private beginPath( color : Color ) : void {
        this.pen.beginPath();
        this.pen.strokeStyle = color.toString();
    };

    private endPath( ) : void {
        this.pen.stroke();
    }

    private closePath() : void {
        this.pen.closePath();
    }

    private beginFill( color : Color ) : void {
        this.pen.fillStyle = color.toString();
    }

    private endFill( ) : void {
        this.pen.fill();
    }

    private restore() : void {
        this.pen.restore();
    }

    private sandboxRender( callback : () => void  ) : void {
        this.save();
        callback( );
        this.restore();
    }

    private fillShape( buffer : ShapeCache , style : Style  ) : void {
        let edge : Array< Vector > = buffer.buffer.edge;
        if( edge.length <= 0 ) return ;

        this.sandboxRender( ( ) => {
            this.beginFill( style.background );
            this.beginPath( style.color );
            
            this.moveTo( edge.at( 0 ) );
            for( let i = 1 ; i < edge.length ; ++ i ){
                this.lineTo( edge.at(i) );
            }
            this.closePath();
            this.endPath();
            this.endFill();
        } )
    };

    private strokeShape( buffer : ShapeCache , style : Style  ) : void {}

    update(deltaTime: number): void {

        // Build PriorityQueue to Render
        super.update( deltaTime );

        // render the queue in order
        while( !this.queue.isEmpty() ){
            let shape : Shape = this.queue.top();
            this.queue.pop();
            
            // draw shape
            let buffer : ShapeCache = null;
            
            if( this.renderBuffer.has( shape.uuid ) && !shape.findComponent('transform').hasUpdated ){
                buffer = this.renderBuffer.get( shape.uuid );
            }else{
                buffer = bufferShape( shape );
            }

            if( buffer != null ){
                this.renderBuffer.set( shape.uuid , buffer );
                // render buffer;
                let style : Style = buffer.ref.style;
                if( style.background != null ){
                    this.fillShape( buffer , style ); 
                }else{
                    this.strokeShape( buffer , style );
                }
            }
            // TODO : render the shape according to the Cache and Render Component
        }
    }

}


bufferShape = function( node : Shape | any  ) : ShapeCache | null {

    // this component is not renderable
    if( !node.hasComponent('renderer') || !node.visible ) return null

    // check whether there exists cache consistent with the shape


    let nodeType = node.shapeType;
    let cache : ShapeCache = null;

    switch ( nodeType ){

        case ShapeType.RECTANGLE : {

            let shape : Rectangle = node;
            let transformScreen = shape.findComponent('transform').transformShapeWorld ;
            let halfWidth = shape.width / 2;
            let halfHeight = shape.height / 2;

            let edge = Matrix.TransformSequence( 
                transformScreen , 
                [   
                    new Vector(- halfWidth ,  halfHeight),
                    new Vector(  halfWidth ,  halfHeight),
                    new Vector(  halfWidth , -halfHeight),
                    new Vector(- halfWidth , -halfHeight)
                ]
            );
            cache = { 
                buffer : { 
                    edge 
                } , 
                ref : shape , 
                type : nodeType 
            };
    
        }break;

        case ShapeType.ARC : {

            let shape : Arc = node;
            let transformScreen : Matrix = shape.findComponent('transform').transformShapeWorld

            let startAngle : number = shape.startAngle * Math.PI / 180;
            let endAngle : number = shape.endAngle * Math.PI / 180;

            let radius = (new Vector(0,shape.radius)).applyTransform( transformScreen ).length();

            let length = 2 * Math.PI * radius;
            let step = ( endAngle - startAngle ) / length;

            let edge : Array< Vector > = new Array< Vector >();

            for( let i = startAngle ; i < endAngle ; i += step ){
                
                let x = Math.cos( i ) , y = Math.sin( i );
                let vert = new Vector( x , y ).applyTransform( transformScreen )
                edge.push( vert );

            }
            
            cache = { 
                buffer : { 
                    center : shape.findComponent('transform').center , 
                    radius : radius ,
                    startAngle : startAngle , 
                    endAngle : endAngle , 
                    edge 
                } , 
                ref : shape , 
                type : nodeType
            };
       
        }break;
        
        case ShapeType.CIRCLE : {
            
            let shape : Circle = node;
            let transformScreen : Matrix = shape.transform.transformShapeWorld ;

            let startAngle = shape.startAngle * Math.PI / 180;
            let endAngle = shape.endAngle * Math.PI / 180;

            let step = ( endAngle - startAngle ) / 100;

            let edge : Array< Vector > = new Array< Vector >();


            for( let i = startAngle ; i < endAngle ; i += step ){
                
                edge.push(
                    new Vector( Math.cos( i ) * shape.radius , Math.sin( i ) * shape.radius )
                );

            }

            edge = Matrix.TransformSequence( transformScreen , edge );
            
            cache = { 
                buffer : { 
                    center : shape.transform.center , 
                    radius : shape.radius ,
                    startAngle : 0 , 
                    endAngle : Math.PI * 2 , 
                    edge 
                } , 
                ref : shape , 
                type : nodeType
            };

        }break;

        case ShapeType.ELLIPSE : {

            let shape : Ellipse = node;
            let mat = new Matrix( shape.a , 0, 0, 0, shape.b, 0, 0, 0, 1 );
            let transformScreen : Matrix = Matrix.Multiply( shape.transform.transformShapeWorld , mat );

            let startAngle = 0;
            let endAngle = Math.PI * 2;
            let step = ( endAngle - startAngle ) / 100;
            let edge : Array< Vector > = new Array< Vector >();

            for( let i = startAngle ; i < endAngle ; i += step ){
                edge.push(
                    new Vector( Math.cos( i ) , Math.sin( i ) )
                );
            }

            edge = Matrix.TransformSequence( transformScreen , edge );

            cache = { 
                buffer : { 
                    a : shape.a ,
                    b : shape.b,
                    edge ,
                } , 
                ref : shape , 
                type : nodeType
            };

        }break;

        case ShapeType.PATH : {
            
            let shape : Path = node;
            let transformScreen = shape.transform.transformShapeWorld ;

            let edge : Array< Vector > = new Array< Vector >();
            let _edge : Array< Vector > = new Array< Vector >();

            for(let i = 0 ; i < shape.points.length ; ++ i){
                let vert = shape.points[i]
                edge.push(vert);
            }

            edge = Matrix.TransformSequence( transformScreen , edge );

            cache = { 
                buffer : { 
                    edge  
                } , 
                ref : shape , 
                type : nodeType
            };

        }break;

        case ShapeType.POLYGON : {

            let shape : Polygon = node;
            let transformScreen = shape.transform.transformShapeWorld ;

            let edge : Array< Vector > = new Array< Vector >();

            for(let i = 0 ; i < shape.vertexes.length ; ++ i){
                edge.push( shape.vertexes[i] );
            }

            edge = Matrix.TransformSequence( transformScreen , edge );

            cache = { 
                buffer : { 
                    edge 
                } , 
                ref : shape , 
                type : nodeType
            };

        }break;
        
        case ShapeType.TEXT : {

            let shape : Text = node;
            let transformScreen = shape.transform.transformShapeWorld ;

            let font = 'bold ' + shape.size + 'px ' + shape.family;

            cache = {
                buffer : {
                    text : shape.text , 
                    font ,
                    position : shape.transform.center.applyTransform( transformScreen )
                },
                ref : shape ,
                type : nodeType
            }

        }break

        case ShapeType.SHAPE:{

            cache = { 
                buffer : { 
                    edge : null 
                } , 
                ref : node , 
                type : nodeType 
            };

        }break;

    }

    return cache;

}

drawArc = function ( renderer : CanvasRenderSystem , cache : ShapeCache , style : Style ) : void {
    
    let pen = renderer.getPen();
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

}

drawRectange = function( renderer : CanvasRenderSystem , cache : ShapeCache , style : Style ) : void {

    let pen = renderer.getPen();
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

drawPolygon = function( renderer : CanvasRenderSystem , cache : ShapeCache, style : Style  ) : void {
    let pen = renderer.getPen();

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

drawPath = function( renderer : CanvasRenderSystem , cache : ShapeCache , style : Style ) : void {

    let pen = renderer.getPen();
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

drawText = function( renderer : CanvasRenderSystem  , cache : ShapeCache , style : Style ) : void {
    let pen = renderer.getPen();
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


export { SystemBase , TransformSystem , RenderSystem , CanvasRenderSystem }