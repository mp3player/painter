import { Timer } from './timer.js'
import { CanvasPainter } from './painter.js'
import { Circle , Rectangle , Polygon , Ellipse , Path , Text } from './geometry.js';
import { Color } from './style.js';
import { Vector3 } from './vector.js';
import { ActiveEvent , EventSystem, MouseActiveEvent } from './system/event.js';
import { TransformSystem } from './system/transform.js';
import { Entity } from './entity.js';

import { PhysicsSystem } from './system/physics.js';
import { CanvasRenderSystem } from './system/render.js'
import { Geometry } from './geometry.js';
import { RendererComponent } from './component/render.js';
import { ShapeComponent } from './component/shape.js';
import { BoxComponent } from './component/box.js';
import { Matrix3 } from './matrix.js';
import { SystemBase } from './system/system.js';


let ellipse : Entity;

class Application {
    
    public static app : Application = null;
    private painter : CanvasPainter ;
    private context : CanvasRenderingContext2D;
    private width : number;
    private height : number;

    private renderSystem : CanvasRenderSystem ;
    private transformSystem : TransformSystem ;
    private eventSystem : EventSystem ;
    private physics : PhysicsSystem ;

    private constructor( ){

        this.context = document.createElement('canvas').getContext('2d');
        this.context.canvas.width = innerWidth ;
        this.context.canvas.height = innerHeight;
        this.context.canvas.style.position = 'absolute';
        this.context.canvas.style.top = '0';
        this.context.canvas.style.left = '0'

        this.painter = new CanvasPainter( this.context );

        this.renderSystem = new CanvasRenderSystem( this.painter , 'render' );
        this.transformSystem = new TransformSystem( this.painter , 'transform' );
        this.eventSystem = new EventSystem( this.painter , 'event' );
        this.physics = new PhysicsSystem( this.painter , 'physics' );

        this.width = innerWidth;
        this.height = innerHeight;

        this.renderSystem.setContext( this.context );

        this.init();

        this.dispatchEvent()

    }

    init() : void {
        
        let renderComponent : RendererComponent = new RendererComponent();
        this.painter.addComponent( renderComponent );
        this.painter.findComponentByClass( RendererComponent ).style.background = new Color( 100 , 100 , 100 );

        this.painter.add( Application.createCircle( 100 ) );

        ellipse = Application.createEllipse( 100 , 50 );
        ellipse.transform.translate( new Vector3( 100 , 200 ) );
        this.painter.add( ellipse );

        let box = new BoxComponent();
        box.setSize( 300 , 300 );
        ellipse.addComponent( box );

        this.painter.add( Application.randomPath() );

        let vertexes = [ -114 ,309, -168 ,225, -130 ,164, -134 ,92, -180 ,124, -202 ,-16, -131 ,-109, -62 ,-58, 117 ,-181, 50 ,8, 188, -9, 257, 183, 113, 124, 121, 303, -5, 256]
        let poly : Array< Vector3 > = [];
        for( let i = 0 ; i < vertexes.length ; i += 2 ){
            let x = vertexes[i];
            let y = vertexes[i + 1];
            poly.push( new Vector3( x , y ) );
        }

        this.painter.add( Application.createPolygon( poly ) );


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
            element.appendChild( this.context.canvas );
        }

    }

    update( deltaTime : number ) : void {

        SystemBase.enQueue( this.painter );
        this.physics.update( deltaTime );
        this.transformSystem.update( deltaTime );
        this.renderSystem.update( deltaTime );
        // ellipse.transform.rotate( .05 );

    }

    run() : void {

        let _update = () => {

            requestAnimationFrame( _update );
            
            let deltaTime = Timer.getDelteTime();
            this.update( deltaTime );
            // this.painter.transform.rotate( .01 );
            // console.log( this.painter.transform.needUpdate )
            
        }
        _update();

    }

    dispatchEvent() : void {

        window.addEventListener('resize' , ( e : Event ) =>{

            // if( painter.resizable ){
            //     painter.resize( innerWidth , innerHeight );
            // }
    
        })

        this.context.canvas?.addEventListener('mousedown' , (e : MouseEvent) => {

            let screenLocation : Vector3 = new Vector3( e.x , e.y );
            let painterLocation = screenLocation.applyTransform( this.painter.transform.inverseTransformShape );
            let event : any = new MouseActiveEvent( e , 'mousedown' , painterLocation );

            this.eventSystem.invokeMouseEvent( 'mousedown' , event );
            this.eventSystem.invokeMouseEvent( 'dragstart' , event );
    
        });
    
        this.context.canvas?.addEventListener('mousemove' , (e : MouseEvent) => {

            let screenLocation : Vector3 = new Vector3( e.x , e.y );
            let painterLocation = screenLocation.applyTransform( this.painter.transform.inverseTransformShape );
            let event : any = new MouseActiveEvent( e , 'mousedown' , painterLocation );

            // this.eventSystem.invokeMouseEvent( 'mousemove' , event );
            // this.eventSystem.invokeMouseEvent( 'drag' , event );
    
        })
    
        this.context.canvas?.addEventListener('mouseup' , (e : MouseEvent) => {

            let screenLocation : Vector3 = new Vector3( e.x , e.y );
            let painterLocation = screenLocation.applyTransform( this.painter.transform.inverseTransformShape );
            let event : any = new MouseActiveEvent( e , 'mousedown' , painterLocation );

            this.eventSystem.invokeMouseEvent( 'mouseup' , event );
            this.eventSystem.invokeMouseEvent( 'drop' , event );
    
        })
    
        this.context.canvas?.addEventListener('contextmenu' , (e) => {
            e.preventDefault();
        })
    
        this.context.canvas?.addEventListener('keydown' , e => {
            return false;
        })
    
        this.context.canvas?.addEventListener('mousewheel' , ( e : WheelEvent ) => {

            let screenLocation : Vector3 = new Vector3( e.x , e.y );
            let painterLocation = screenLocation.applyTransform( this.painter.transform.inverseTransformShape );
            let event : any = new MouseActiveEvent( e , 'mousedown' , painterLocation );
            
            this.eventSystem.invokeMouseEvent( 'mousewheel' , event );

        })

    }

    public screenToPainter( coord : Vector3 ) : Vector3 {
        return new Vector3
    }

    public painterToScreen( coord : Vector3 ) : Vector3 {
        return new Vector3
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

    static createPolygon( path : Array< Vector3 > ) : Entity {
        
        let poly = new Polygon( path );

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
            poly.append( new Vector3( x , y ) );
        }

        let shapeComponent : ShapeComponent = new ShapeComponent( poly );
        let entity : Entity = new Entity();
        entity.addComponent( shapeComponent );
        return entity ;

    }
    
    static createTriangle( points : Array< Vector3 >){

        let poly = new Polygon( points );

        let shapeComponent : ShapeComponent = new ShapeComponent( poly );

        let entity : Entity = new Entity();

        entity.findComponentByClass( RendererComponent ).style.background = Color.Red;
        entity.findComponentByClass( RendererComponent  ).style.color = Color.Blue;
        entity.addComponent( shapeComponent );

        return entity ;

    }

}




export { Application }