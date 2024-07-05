import { Buffer } from "../buffer.js";
import { _Comp, ArrayList, PriorityQueue } from "../container/collection.js";
import { Entity } from "../entity.js";
import { Matrix3 } from "../matrix.js";
import { CanvasPainter } from "../painter.js";
import { Path } from "../geometry.js";
import { Color, Style } from "../style.js";
import { SystemBase, TransformedShapeRenderedBuffer } from "./system.js";
import {  Vector3 } from "../vector.js";
import { TransformComponent } from "../component/transform.js";
import { RendererComponent } from "../component/render.js";
import { ShapeComponent } from "../component/shape.js";
import { CircleComponent } from "../component/circle.js";
import { BoxComponent } from "../component/box.js";





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

        let width : number = this.getContextWidth();
        let height : number = this.getContextHeight();

        this.setProperty( "fillStyle" , renderComponent.style.background );
        this._context.fillRect( 0 , 0 , width , height );
        this.fill();

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

    public moveTo( point : Vector3 ) : void {
        this._context.moveTo( point.x , point.y );
    }

    public lineTo( point : Vector3 ) : void {
        this._context.lineTo( point.x , point.y );
    }

    public save() : void {
        this._context.save();
    }

    public restore() : void {
        this._context.restore();
    }

    public beginPath() : void {
        this._context.beginPath();
    };

    public closePath() : void {
        this._context.closePath();
    }

    public stroke() : void {
        this._context.stroke();
    }

    public fill() : void {
        this._context.fill();
    }

    private bufferPath( edge : Array< Vector3 > ){

        if( edge.length <= 0 ) return ;

        this.moveTo( edge.at(0) );

        for( let i = 1 ; i < edge.length ; ++ i ){
            this.lineTo( edge.at(i) );
        }

    }

    private fillShape( node : Entity ) : void {

        let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );
        let renderBuffer : TransformedShapeRenderedBuffer = SystemBase.MapedRenderBuffer.get( node.uuid );
        let buffer : Array<Vector3> = renderBuffer.getBuffer();

        this.save();
        this.beginPath();
        this.setStyle( renderComponent );
        this.bufferPath( buffer );
        this.closePath();
        this.fill();
        this.restore();

    };

    private strokeShape( node : Entity ) : void {

        let renderComponent = node.findComponentByClass( RendererComponent );
        let buffer : Array<Vector3 > = SystemBase.MapedRenderBuffer.get( node.uuid ).getBuffer();

        this.save();
        this.beginPath();
        this.setStyle( renderComponent );
        this.bufferPath( buffer );
        this.stroke();
        this.restore();

    }

    public strokeText( node : Entity ) : void {
        
    }

    public fillText( node : Entity ) : void {

    }

    public drawShape( node : Entity ) : void {
        
        let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );
        if( renderComponent.style.background != null ){
            this.fillShape( node );
        }else {
            this.strokeShape( node );
        }

    }

    private setProperty( name : string , value : any ) : void {

        if( this._context[name] ){
            this._context[name] = value;
        }else{
            console.warn( 'this context has no property named : ' , name );
        }

    }

    private render(){

        this.flush();

        let queue : Array< Entity > = SystemBase.EntityOrderedList.getOrderedData();


        for( let i = 0 ; i < queue.length ; ++ i  ){

            let node : Entity = queue.at( i );

            if( SystemBase.CreateRenderBuffer( node ) ){
                this.drawShape( node );
            }

        }
    }

    update(deltaTime: number): void {
        this.render();
    }



}


export { CanvasRenderSystem  , TransformedShapeRenderedBuffer }