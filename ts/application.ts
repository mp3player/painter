import { Timer } from './timer.js'
import { Painter } from './painter.js'
import { Circle , Rectangle , Polygon , Ellipse , Path , Text } from './shape.js';
import { Color } from './style.js';
import { Vector } from './vector.js';
import { ActiveEvent , EventSystem, MouseActiveEvent } from './event.js';
import { CanvasRenderSystem, TransformSystem } from './system.js';
import { Entity } from './entity.js';
import { ShapeComponent } from './component.js';

let ellipse : Entity;

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
        this.eventSystem = new EventSystem( this.painter , 'event' , this.context );

        this.width = innerWidth;
        this.height = innerHeight;

        this.renderSystem.resize( this.width , this.height );

        this.init();

    }

    init() : void {

        this.painter.findComponent('renderer').style.background = new Color( 100 , 100 , 100 );

        this.painter.add( Application.createCircle( 100 ) );

        this.painter.add( Application.createPolygon() );
    
        ellipse = Application.createEllipse( 100 , 50 );
        ellipse.transform.translate( new Vector( 100 , 200 ) );
        this.painter.add(  ellipse );

        this.painter.add( Application.randomPath() );


        // let center = new Circle( 100 );
        // center.findComponent('renderer').style.background = Color.Red;
        // this.painter.add( center );

        // let border = new BorderBoxComponent();
        // center.addComponent( border );
        // let rect : Rectangle = new Rectangle(20,20,200,300);
        // rect.findComponent('renderer').style.background = Color.Black;
        
        // this.painter.add( rect );

        // center.index = 10;




        // let polygon = new Polygon([] , 0 , 0);
        // polygon.append( new Vector(  0 , 0 ) )
        // polygon.append( new Vector(  100 , 100 ) )
        // polygon.append( new Vector(  100,-300) )

        // rect.add( polygon )
        // document.onmousedown = () => {
        //     rect.removeComponent('renderer')
        // }
        


        // let str = `「如果尖銳的批評完全消失，溫和的批評將會變得刺耳。\n
        // 如果溫和的批評也不被允許，沈默將被認為居心叵測。\n
        // 如果沈默也不再允許，贊揚不夠賣力將是一種罪行。\n
        // 如果只允許一種聲音存在，那麼，唯一存在的那個聲音就是謊言。」`
        // let text = new Text(str );
        // text.index = 200;
        // text.size = 20;
        // painter.add( text )

        // rect.transform.setRotation( Math.PI / 4 ) ;

        // let ellipse = new Ellipse( 50 ,100 , 100 , 100 );
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

        this.transformSystem.update( deltaTime );
        this.renderSystem.update( deltaTime );

    }

    run() : void {

        let _update = () => {

            requestAnimationFrame( _update );
            
            let deltaTime = Timer.getDelteTime();
            this.update( deltaTime );
            // this.painter.transform.rotate( .01 );
            
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

    static createCircle( radius : number ) : Entity {
        
        let circle = new Circle( radius );
        let shapeComponent : ShapeComponent = new ShapeComponent( circle );
        let entity : Entity = new Entity();
        entity.addComponent( shapeComponent );
        return entity ;

    }

    static createEllipse( a : number , b : number ) : Entity {
        
        let ellipse = new Ellipse( a , b );
        let shapeComponent : ShapeComponent = new ShapeComponent( ellipse );
        let entity : Entity = new Entity();
        entity.addComponent( shapeComponent );
        return entity ;

    }

    static createPolygon( ) : Entity {
        
        let poly = new Polygon([]);

        poly.append( new Vector( 0 , 0  ) );
        poly.append( new Vector( 100 , 100 ) );
        poly.append( new Vector( 100 , 0 ) );

        let shapeComponent : ShapeComponent = new ShapeComponent( poly );
        let entity : Entity = new Entity();
        entity.addComponent( shapeComponent );
        return entity ;

    }

    static randomPath() : Entity {

        let poly = new Path();

        for( let i = 0 ; i < 4 ; ++ i ){
            let x = ( Math.random() - .5 ) * innerWidth;
            let y = ( Math.random() - .5 ) * innerHeight;
            poly.append( new Vector( x , y ) );
        }

        let shapeComponent : ShapeComponent = new ShapeComponent( poly );
        let entity : Entity = new Entity();
        entity.addComponent( shapeComponent );
        return entity ;

    }

}

export { Application }