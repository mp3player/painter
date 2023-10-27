import { Buffer } from "./buffer.js";
import { ArrayList, PriorityQueue } from "./collection.js";
import { BoxComponent, CircleComponent, Component, ShapeComponent, TransformComponent } from "./component.js";
import { Entity } from "./entity.js";
import { Painter } from "./painter.js";
import { Path, Shape } from "./shape.js";
import { Color, Style } from "./style.js";
import { SystemBase } from "./system.js";
import { BorderBox, BorderCircle } from "./util.js";
import { Matrix, Vector } from "./vector.js";


class RenderBuffer extends Buffer {

    private data : Array< Vector >
    private path : Path2D;
    private ref : Entity
    
    public constructor( data : Array< Vector > , ref : Entity ){
        super()
        this.data = data;
        this.ref = ref;
    }

    getData() : Array< Vector > {
        return this.data;
    }

};

abstract class Renderer extends Component {
    
    public style : Style ;
    private needUpdate : boolean = true ;

    constructor( name : string = "Default CanvasRender" ){
        super( name );
        this.style = new Style();
    }
    
    // TODO : implementation Component::update  
    abstract update( deltaTime : number ) : void ;

}

class RendererComponent extends Renderer {

    constructor( name : string = "Default ShapeRendererComponent" ){
        super( name );
    }

    public update( deltaTime : number ) : void {

    }

}



class RenderSystem extends SystemBase {

    protected queue : PriorityQueue< Entity > = new PriorityQueue< Entity >;

    public constructor( scene : Painter , name : string = 'render' ) {
        super( scene , name );
    }

    update( deltaTime : number ) : void {
        // get all shape 

        this.enQueue();

    }

    protected enQueue() : void {

        this.queue.clear();
        let map : Map<string , boolean > = new Map<string , boolean>();

        let process = ( node : Entity ) => {

            if( !map.has( node.uuid ) && node.hasComponent('renderer') ){
                this.queue.push( node );
                map.set( node.uuid , true );
            }

            let list : ArrayList< Shape > = node.children;
            for( let i = 0 ; i < list.length ; ++ i ){
                let shape : Entity = list.get( i );
                process( shape );
            }
            
        }

        for( let i = 0 ; i < this.scene.children.length ; ++ i ){
            
            process( this.scene.children.get( i ) );
        }

    }

}

class CanvasRenderSystem extends RenderSystem {
    
    private canvas : HTMLCanvasElement | null ;
    private pen : CanvasRenderingContext2D | null ;

    private width : number = 0;
    private height : number = 0;

    private renderBuffer : Map< string , RenderBuffer > = new Map< string , RenderBuffer >;

    public constructor( scene : Painter , name : string = 'render' , canvas : HTMLCanvasElement | null ) {
        super( scene , name );
        this.canvas = canvas;
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

    public flush( ) : void{
        if( !this.pen ) return ;

        let renderComponent : RendererComponent = this.scene.findComponent('renderer');

        this.save();

        this.beginFill( renderComponent.style.background );

        this.beginPath( Color.Black );
        this.moveTo( new Vector( -this.width / 2 , this.height / 2) );

        this.lineTo( new Vector( this.width / 2 , this.height / 2) )
        this.lineTo( new Vector( this.width / 2 , -this.height / 2) )
        this.lineTo( new Vector( -this.width / 2 , -this.height / 2) )

        this.closePath();

        this.endFill();
        this.restore();
    }

    // TODO : finish the correction
    public setStyle(  renderComponent : Renderer ) : void {

        let style : Style = renderComponent.style ;
        let pen = this.pen;
        if( style.background ) pen.fillStyle = style.background.toString();
        if( style.color ) pen.strokeStyle = style.color.toString();
        pen.lineWidth = style.lineWidth;
        pen.lineJoin = 'round';
        pen.lineCap = 'round';
        pen.globalAlpha = style.opacity;

    }

    private moveTo( point : Vector ) : void {
        this.pen.moveTo( point.x , point.y );
    }

    private lineTo( point : Vector ) : void {
        this.pen.lineTo( point.x , point.y );
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

    private bufferPath( edge : Array< Vector > ){

        if( edge.length <= 0 ) return ;

        this.moveTo( edge.at(0) );

        for( let i = 1 ; i < edge.length ; ++ i ){
            this.lineTo( edge.at(i) );
        }

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

    private fillShape( edge : Array< Vector > , renderComponent : Renderer  ) : void {

  
        if( edge.length <= 0 ) return ;

        this.sandboxRender( ( ) => {

            this.setStyle( renderComponent );
            this.beginFill( renderComponent.style.background );
            this.beginPath( renderComponent.style.color );
            
            this.bufferPath( edge );
            
            this.closePath();
            this.endPath();
            this.endFill();
        } )
    };

    private strokeShape( buffer : RenderBuffer , renderComponent : Renderer ) : void {

        if( buffer.getData().length <= 0 ) return ;
        let edge : Array< Vector > = buffer.getData();

        this.sandboxRender( ( ) => {
            this.save();

            this.setStyle( renderComponent );
            this.beginPath( renderComponent.style.color );

            this.bufferPath( edge );

            this.closePath();
            this.endPath();

            this.restore();
        })

    }

    private setProperty( name : string , value : any ) : void {



    }

    update(deltaTime: number): void {
        // Build PriorityQueue to Render
        this.enQueue();

        // clear RenderContent
        this.flush();

        // render the queue in order
        while( !this.queue.isEmpty() ){

            let node : Entity = this.queue.top();

            let transformComponent : TransformComponent = node.findComponent('transform');
            let shapeComponent : ShapeComponent = node.findComponent('shape');
            let renderComponent : RendererComponent = node.findComponent('renderer');
            let borderBoxComponent : CircleComponent = node.findComponent('box');

            renderComponent.update( deltaTime );

            this.queue.pop();

            let points = shapeComponent.getPoints();
            let buffer : RenderBuffer = null;

            if( !this.renderBuffer.has( node.uuid ) || node.findComponent('transform').hasUpdated ){

                buffer = new RenderBuffer( Matrix.TransformSequence( transformComponent.transformShapeWorld, points ) , node );
                this.renderBuffer.set( node.uuid , buffer );

            }else{
                
                buffer = this.renderBuffer.get( node.uuid );
            }

            if( shapeComponent.shape instanceof Path ){

                this.strokeShape( buffer , renderComponent );

            }else if( shapeComponent.shape instanceof Text ){

            }else{

                this.fillShape( buffer.getData() , renderComponent )

            }

            // render Box : false;
            if( borderBoxComponent && borderBoxComponent.visible ){
                
                // borderBoxComponent.update( deltaTime );
                // let borderBox : BorderBox = borderBoxComponent.borderBox;
                // let borderCircle : BorderCircle = borderBoxComponent.borderCircle;
                // let box : Array< Vector > = Matrix.TransformSequence( borderBoxComponent.transform , borderBox.getBorder() );
                // let circle : Array < Vector > = Matrix.TransformSequence( borderBoxComponent.transform , borderCircle.getBorder() );
                // // box 
                // this.save();

                // this.beginPath( Color.Black )

                // this.pen.lineWidth = 1;
                // this.pen.lineDashOffset = borderBoxComponent.dash
                // this.pen.setLineDash([4,4]);

                // this.bufferPath( box );
                // this.closePath();
                // this.endPath();

                // this.restore();
                
                
                // // circle
                // this.save();

                // this.beginPath( Color.Black )

                // this.pen.lineWidth = 1;
                // this.pen.lineDashOffset = borderBoxComponent.dash
                // this.pen.setLineDash([4,4]);

                // this.bufferPath( circle );
                // this.closePath();
                // this.endPath();

                // this.restore();

                // borderBoxComponent.dash += 1
                // borderBoxComponent.dash %= 8;

            }

            // TODO : render the shape according to the Cache and Render Component

        }
    }

}


export {Renderer , RendererComponent , CanvasRenderSystem }