import { Timer } from './timer.js'
import { Painter } from './painter.js'
import { Circle , Rectangle , Polygon , Ellipse , Path , Text } from './shape.js';
import { Color } from './style.js';
import { Vector } from './vector.js';
import { ActiveEvent , EventSystem, MouseActiveEvent } from './event.js';
import { CanvasRenderSystem, TransformSystem } from './system.js';



class Application {
    
    public static app : Application = null;
    private painter : Painter ;
    private context : HTMLCanvasElement;
    private width : number;
    private height : number;

    private renderSystem : CanvasRenderSystem ;
    private transformSystem : TransformSystem ;
    private eventSystem : EventSystem;

    private constructor( ){
        this.painter = new Painter();

        this.context = document.createElement('canvas');
        this.renderSystem = new CanvasRenderSystem( this.painter , 'render' , this.context );
        this.transformSystem = new TransformSystem( this.painter , 'transform' );

        this.width = innerWidth;
        this.height = innerHeight;

        this.renderSystem.resize( this.width , this.height );

        this.init();

    }

    init() : void {

        this.painter.background = new Color( 100 , 100 , 100 );

        let center = new Circle(100,0,0);
        center.style.background = Color.Red;
        this.painter.add( center );

        // let border = new BorderBoxComponent();
        // center.addComponent( border );
        let rect : Rectangle = new Rectangle(20,20,200,300);
        rect.style.background = Color.Black;
        
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


        let str = `「如果尖銳的批評完全消失，溫和的批評將會變得刺耳。\n
        如果溫和的批評也不被允許，沈默將被認為居心叵測。\n
        如果沈默也不再允許，贊揚不夠賣力將是一種罪行。\n
        如果只允許一種聲音存在，那麼，唯一存在的那個聲音就是謊言。」`
        let text = new Text(str );
        text.index = 200;
        text.size = 20;
        // painter.add( text )

        rect.transform.setRotation( Math.PI / 4 ) ;

        let ellipse = new Ellipse( 50 ,100 , 100 , 100 );
        this.painter.add( ellipse );
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

        this.transformSystem.update( deltaTime );
        this.renderSystem.update( deltaTime );

    }

    run() : void {

        let _update = () => {
            requestAnimationFrame( _update );
            let deltaTime = Timer.getDelteTime();
            this.update( deltaTime );
            this.painter.transform.rotate( -.01 );
            
        }
        _update();

    }


    static createInstance( element : string | HTMLElement ) : Application {
        if( !Application.app ){
            Application.app = new Application();
        }
        console.log( Application.app )
        Application.app.appendTo( element );
        return Application.app;
    }

}

export { Application }