import { Color, Style } from "./style.js";
import { Component } from "./component.js";
import { Shape } from "./shape.js";


abstract class Renderer extends Component {
    public abstract render() : void ;
}

class CanvasRenderer extends Renderer {

    public canvas : HTMLCanvasElement ;
    public pen : CanvasRenderingContext2D | null ;
    private width : number; 
    private height : number;

    constructor( name : string = "Default CanvasRender" ){
        super( name );
        this.canvas = null;
        this.pen = null;
    }

    setContext( canvas : HTMLCanvasElement , pen : CanvasRenderingContext2D ) : void {
        this.canvas = canvas;
        this.pen = pen;
    }

    resize( width : number = innerWidth , height : number = innerHeight ) : void {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
    }

    getCanvas() : HTMLCanvasElement | null {
        return this.canvas
    }

    getPen() : CanvasRenderingContext2D | null {
        return this.pen;
    }

    flush( color : Color ) : void{
        if( !this.pen ) return ;

        this.pen.save();

        this.pen.fillStyle = color.toString()
        this.pen.fillRect( 0 , 0 , this.width , this.height );
        this.pen.fill();
        this.pen.restore();
    }

    // TODO : finish the correction
    setStyle(  style : Style ) : void {
        let pen = this.pen;
        if( style.background ) pen.fillStyle = style.background.toString();
        if( style.color ) pen.strokeStyle = style.color.toString();
        pen.lineWidth = style.lineWidth;
        pen.lineJoin = 'round';
        pen.lineCap = 'round';
        pen.globalAlpha = style.opacity;
    }

    stroke( ) : void {
        this.pen.stroke();
    }

    fill( ) : void {
        this.pen.fill();
    }

    setRender( style : Style ) : void {
        if(style.background != null)
            this.fill();
        
        if(style.lineWidth > 0)
            this.stroke( );
    }

    save(){
        this.pen.save();
    }

    restore(){
        this.pen.restore();
    }

    sandboxRender( callback : ( pen : CanvasRenderingContext2D ) => void  ) : void {
        this.save();
        callback( this.pen );
        this.restore();
    }
    
    // TODO : implementation Component::update  
    update( deltaTime : number ) : void {

    }

    // TODO : implement Renderer::render
    public render( ): void {
        
        console.log( this.shape );

    }

}

class BorderBoxComponent extends CanvasRenderer {

    constructor( name : string = "Default BorderBoxComponent" ){
        super( name );
    }

    // TODO : override 
    // [ render | process ] the box of the shape this component attached to
    public update( deltaTime : number ) : void {
        
    }

    public render(): void {
        
    }

}

class BorderCircleComponent extends CanvasRenderer {

    constructor( name : string = "Default BorderCircleComponent" ){
        super( name );
    }

    public render() : void {

    }

}



export { Renderer , CanvasRenderer , BorderBoxComponent , BorderCircleComponent }