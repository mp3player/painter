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
    private _filled : boolean = true;
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
    
    private mapedRenderBuffer : Map< string , RenderBuffer > = new Map< string , RenderBuffer >;
    private orderedRenderBuffer : PriorityQueue< RenderBuffer > = new PriorityQueue< RenderBuffer>();

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
        let renderBuffer : RenderBuffer = this.mapedRenderBuffer.get( node.uuid );
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
        let buffer : Array<Vector3 > = this.mapedRenderBuffer.get( node.uuid ).getBuffer();

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

    private createBuffer( node : Entity ) : boolean {

        let shapeComponent : ShapeComponent = node.findComponentByClass( ShapeComponent );
        let transformComponent : TransformComponent = node.findComponentByClass( TransformComponent );
        let renderComponent : RendererComponent = node.findComponentByClass( RendererComponent );

        if( !shapeComponent || !transformComponent ) return false;

        shapeComponent.updateFix();

        let points = shapeComponent.getPoints();
        let buffer : RenderBuffer = null;

        // read buffer or create buffer according the entity 
        if( !this.mapedRenderBuffer.has( node.uuid ) ){

            buffer = new RenderBuffer( Matrix3.TransformSequence( transformComponent.transformShapeWorld, points ) , node );
            this.mapedRenderBuffer.set( node.uuid , buffer );
            this.orderedRenderBuffer.push( buffer );

            if( renderComponent.style.background == null ) buffer.filled = false;

        }else{
            buffer = this.mapedRenderBuffer.get( node.uuid );
        }

        return true;
    }

    public readOrderedBuffer() : PriorityQueue< RenderBuffer >{
        return this.orderedRenderBuffer;
    } 

    private clearBuffer(){
        this.mapedRenderBuffer.clear();
        this.orderedRenderBuffer.clear();
    }

    private render(){

        // Build PriorityQueue to Render

        // clear RenderContent
        this.flush();

        // render the queue in order
        let queue : Array< Entity > = SystemBase.EntityBuffer.getOrderedData();
        for( let i = 0 ; i < queue.length ; ++ i  ){

            let node : Entity = queue.at( i );

            if( this.createBuffer( node ) ){
                this.drawShape( node );
            }

        }
    }

    update(deltaTime: number): void {
        this.render();
    }



}


export { CanvasRenderSystem }