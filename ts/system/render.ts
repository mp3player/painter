import { Buffer } from "../buffer.js";
import { ArrayList, PriorityQueue } from "../collection.js";
import { Entity } from "../entity.js";
import { Matrix3 } from "../matrix.js";
import { CanvasPainter } from "../painter.js";
import { Path } from "../geometry.js";
import { Color, Style } from "../style.js";
import { SystemBase } from "./system.js";
import {  Vector3 } from "../vector.js";
import { TransformComponent } from "../component/transform.js";
import { RendererComponent } from "../component/render.js";
import { ShapeComponent } from "../component/shape.js";
import { CircleComponent } from "../component/circle.js";
import { BoxComponent } from "../component/box.js";





class RenderBuffer extends Buffer {

    private _data : Array< Vector3 >
    private _path : Path2D;
    private _ref : Entity

    public get path(){
        return this._path;
    }

    public get data(){
        return this._data;
    }

    public get ref (){
        return this._ref;
    }
    
    public constructor( data : Array< Vector3 > , ref : Entity ){
        super()
        this._data = data;
        this._ref = ref;
    }

    getData() : Array< Vector3 > {
        return this.data;
    }

};

abstract class RenderSystem extends SystemBase {

    protected _context : any;

    public constructor( scene : CanvasPainter , name : string = 'render' ) {
        super( scene , name );
    }

    public setContext( _context : CanvasRenderingContext2D ) : void {
        this._context = _context;
    }

    public abstract getContextWidth() : number ;
    public abstract getContextHeight() : number ;

    update( deltaTime : number ) : void {

    }

    

}

class CanvasRenderSystem extends RenderSystem {
    
    private renderBuffer : Map< string , RenderBuffer > = new Map< string , RenderBuffer >;

    public constructor( scene : CanvasPainter , name : string = 'render') {
        super( scene , name );
        this.init();
    }

    public getContextWidth() : number {
        if( this._context == null ) return 0;
        return this._context.canvas.width;
    }

    public getContextHeight() : number {
        if( this._context == null ) return 0;
        return this._context.canvas.height;
    }

    public flush( ) : void{
        if( !this._context ) return ;

        let renderComponent : RendererComponent = this.scene.findComponentByClass( RendererComponent );

        this.save();

        this.beginFill( renderComponent.style.background );

        this.beginPath( );
        this.moveTo( new Vector3( 0, 0) );

        this.lineTo( new Vector3( 0 , this.getContextHeight() ) )
        this.lineTo( new Vector3( this.getContextWidth() , this.getContextHeight() ) )
        this.lineTo( new Vector3( this.getContextWidth() , 0 ) )

        this.closePath();

        this.endFill();
        this.restore();
    }

    // TODO : finish the correction
    public setStyle(  renderComponent : RendererComponent ) : void {

        let style : Style = renderComponent.style ;
        let config : any = style.toJson();
        for( let key in config ){
            this.setProperty( key , config[key] );
        }

    }

    private moveTo( point : Vector3 ) : void {
        this._context.moveTo( point.x , point.y );
    }

    private lineTo( point : Vector3 ) : void {
        this._context.lineTo( point.x , point.y );
    }

    private save() : void {
        this._context.save();
    }

    private beginPath() : void {
        this._context.beginPath();
    };

    private endPath( ) : void {
        this._context.stroke();
    }

    private closePath() : void {
        this._context.closePath();
    }

    private bufferPath( edge : Array< Vector3 > ){

        if( edge.length <= 0 ) return ;

        this.moveTo( edge.at(0) );

        for( let i = 1 ; i < edge.length ; ++ i ){
            this.lineTo( edge.at(i) );
        }

    }

    private beginFill( color : Color ) : void {
        this._context.fillStyle = color.toString();
    }

    private endFill( ) : void {
        this._context.fill();
    }

    private restore() : void {
        this._context.restore();
    }

    private sandboxRender( callback : () => void  ) : void {
        this.save();
        callback( );
        this.restore();
    }

    private fillShape( edge : Array< Vector3 > , renderComponent : RendererComponent  ) : void {
        if( edge.length <= 0 ) return ;

        this.sandboxRender( ( ) => {

            this.setStyle( renderComponent );
            this.beginPath( );
            this.bufferPath( edge );
            this.closePath();
            this.endPath();
            this.endFill();

        } )
    };

    private strokeShape( buffer : RenderBuffer , renderComponent : RendererComponent ) : void {

        if( buffer.getData().length <= 0 ) return ;
        let edge : Array< Vector3 > = buffer.getData();

        this.sandboxRender( ( ) => {
            this.save();

            this.setStyle( renderComponent );
            this.beginPath( );

            this.bufferPath( edge );

            this.closePath();
            this.endPath();

            this.restore();
        })

    }

    private setProperty( name : string , value : any ) : void {

        if( this._context[name] ){
            this._context[name] = value;
        }else{
            console.warn( 'this context has no property named : ' , name );
        }

    }

    update(deltaTime: number): void {

        // Build PriorityQueue to Render

        // clear RenderContent
        this.flush();

        // render the queue in order
        while( !SystemBase.EntityBuffer.isEmpty() ){

            let node : Entity = SystemBase.EntityBuffer.top();

            let transformComponent : TransformComponent = node.findComponentByClass( TransformComponent );
            let shapeComponent : ShapeComponent = node.findComponentByClass( ShapeComponent );
            let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );

            // has no shape component
            if( !shapeComponent ) continue;

            shapeComponent.update( deltaTime );

            // dequeue this entity
            SystemBase.EntityBuffer.pop();

            let points = shapeComponent.getPoints();
            let buffer : RenderBuffer = null;

            // read buffer or create buffer according the entity 
            if( !this.renderBuffer.has( node.uuid ) ){

                buffer = new RenderBuffer( Matrix3.TransformSequence( transformComponent.transformShapeWorld, points ) , node );
                this.renderBuffer.set( node.uuid , buffer );

            }else{
                buffer = this.renderBuffer.get( node.uuid );
            }

            //render this shape 

            if( shapeComponent.shape instanceof Path ){

                this.strokeShape( buffer , renderComponent );

            }else if( shapeComponent.shape instanceof Text ){



            }else{

                this.fillShape( buffer.getData() , renderComponent )

            }

            // process other component 
            
            let box : BoxComponent = node.findComponentByClass( BoxComponent );
            if( box ){

                // transform 
                let border : Array< Vector3 > = box.box.getBorder();
                border = Matrix3.TransformSequence( transformComponent.transformShapeWorld, border );
                this.beginPath( );

                this.setProperty( 'strokeStyle' , 'red' );

                this.sandboxRender( () => {
                    this.bufferPath( border );
                }   )

                this.closePath();
                this.endPath();


            }

            let circle : CircleComponent = node.findComponentByClass( CircleComponent );
            if( circle ){

            }
            

            // render Box : false;
            //if( borderBoxComponent && borderBoxComponent.visible ){
                
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

            // }

            // TODO : render the shape according to the Cache and Render Component

        }
    }

}


export { CanvasRenderSystem }