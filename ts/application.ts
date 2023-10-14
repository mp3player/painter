import { Timer } from './timer.js'
import { Painter } from './painter.js'
import { Circle , Rectangle , Polygon , Ellipse , Path , Text } from './shape.js';
import { Color } from './style.js';
import { Vector } from './vector.js';
import { ActiveEvent , MouseActiveEvent } from './event.js';
import { CanvasRenderSystem, TransformSystem } from './system.js';

let rect : Rectangle = new Rectangle(20,20,200,300);
rect.style.background = Color.Black;


class Application {
    
    public static app : Application = null;
    private painter : Painter ;
    private renderSystem : CanvasRenderSystem ;
    private transformSystem : TransformSystem ;

    private constructor( ){
        this.painter = new Painter();
        this.renderSystem = new CanvasRenderSystem( this.painter , 'render' );
        this.transformSystem = new TransformSystem( this.painter , 'transform' );
        this.init();
    }

    static createInstance( element : string | HTMLElement ) : Application {
        if( !Application.app ){
            Application.app = new Application();
        }
        console.log( Application.app )
        Application.app.appendTo( element );
        return Application.app;
    }

    init() : void {

        this.painter.background = new Color( 100 , 100 , 100 );

        let center = new Circle(100,0,0);
        center.style.background = Color.Red;
        this.painter.add( center );

        // let border = new BorderBoxComponent();
        // center.addComponent( border );

        this.painter.add( rect );

        center.index = 10;


        this.painter.on( 'mousemove', ( event : ActiveEvent ) => {
            // e.target.style.color = 'blue';
            // e.target.style.lineWidth = 4;
        })


        this.painter.on( 'mouseup' , ( event : ActiveEvent ) => {
            // e.target.style.color = 'rgba(0,0,0,.2)'
            // e.target.style.lineWidth = 1;
        })


        let polygon = new Polygon([] , 0 , 0);
        polygon.append( new Vector(  0 , 0 ) )
        polygon.append( new Vector(  100 , 100 ) )
        polygon.append( new Vector(  100,-300) )

        rect.add( polygon )

        let path = new Path();

        for( let i = 0 ; i < 8 * Math.PI / 18.0  ; i += .001 ){
            path.append( new Vector( i * 10 , Math.log( Math.tan( i / 2 + Math.PI / 4 ) ) * 10 ) );
        }

        path.style.background = null;

        this.painter.add( path );


        let str = `「如果尖銳的批評完全消失，溫和的批評將會變得刺耳。\n
        如果溫和的批評也不被允許，沈默將被認為居心叵測。\n
        如果沈默也不再允許，贊揚不夠賣力將是一種罪行。\n
        如果只允許一種聲音存在，那麼，唯一存在的那個聲音就是謊言。」`
        let text = new Text(str );
        text.index = 200;
        text.size = 20;
        // painter.add( text )

        

        let ellipse = new Ellipse( 50 ,100 , 100 , 100 );
        // this.painter.add( ellipse );
    }

    appendTo( id : string | HTMLElement ) : void {
        
        let element : any;
        
        if( id instanceof String ){
            element = document.querySelector( '#' + id );
        }else{
            element = id;
        }

        if( element ){
            element.appendChild( this.renderSystem.getCanvas() );
        }

    }

    update( deltaTime : number ) : void {

        // this.painter.flush();
        this.transformSystem.update( deltaTime );
        this.renderSystem.update( deltaTime );

    }

    run() : void {

        let _update = () => {
            requestAnimationFrame( _update );
            let deltaTime = Timer.getDelteTime();
            this.update( deltaTime );

            rect.transform.rotate( .02) ;
        }
        _update();

    }

}

export { Application }