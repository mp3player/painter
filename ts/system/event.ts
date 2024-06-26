import { Shape } from "../geometry.js";
import { CanvasPainter } from "../painter.js";
import { SystemBase } from "./system.js";
import { Vector3  } from "../vector.js";
import { Entity } from "../entity.js";

class EventType { 

    static UNKNOW = 'unknow' ; 
    static MOUSEDOWN = 'mousedown' ;
    static MOUSEUP = 'mouseup' ;
    static MOUSEMOVE = 'mousemove' ; 
    static MOUSEWHEEL = 'mousewheel' ;
    static MOUSEENTER = 'mouseenter' ;
    static MOUSELEAVE = 'mouseleave'

};

abstract class ActiveEvent {
    protected  _originEvent : MouseEvent ;
    public target : EventListener | null ;
    
    public get originEvent(){
        return this._originEvent;
    }

    constructor( event : MouseEvent ){
        this._originEvent = event;
        this.target = null;
    }
}



// read-only properties
class MouseActiveEvent extends ActiveEvent{

    private _name : EventType;               // the name  
    private _painterLocation : Vector3;
    private _screenLocation : Vector3 ;
    public paths : Array< EventListener >

    public get name(){
        return this._name;
    }

    public get painterLocation(){
        return this._painterLocation.clone();
    }

    public get screenLocation(){
        return this._screenLocation.clone();
    }

    public get originEvent(){
        return this._originEvent;
    }

    constructor(
        event : MouseEvent | null ,
        name = EventType.UNKNOW , 
        painterLocation : Vector3
    ){
        super( event )
        this._name = name ;
        this._painterLocation = painterLocation.clone();
        this._screenLocation = new Vector3( event.x , event.y );
        this.paths = [];
    }

}

class KeyActiveEvent extends ActiveEvent {
    
};

type CallBack = ( event : ActiveEvent ) => void;

class EventListener{

    public registedEvent : Map<string ,any>;
    public handler : any;
    public dragable : boolean;

    constructor(){
        this.registedEvent = new Map();
        this.handler = {};
        this.dragable = false;
    }
    
    // TODO : the name will be override
    // the two EventListeners with two same name will not be retained at the same time
    on( eventName : string , callback : CallBack ) : void {
        this.registedEvent.set( eventName , callback.bind( this ) );
    }

    off( eventName : string ) : boolean {
        return this.registedEvent.delete( eventName );
    }

    trigger( name : string , event : any ) : void {
        if( this.registedEvent.has( name ) ){
            event.paths.push( this );
            let callback = this.registedEvent.get( name );
            callback( event );
        }
    }

    hasEvent( eventName : string ){
        return this.registedEvent.has( eventName );
    }
    
}

class EventSystem extends SystemBase {

    public constructor( env : CanvasPainter , name : string = "evnet" ){
        super( env , name );
        this.init();
    }

    public init() : void {
        
    }

    public invokeMouseEvent( eventName : string , event : MouseActiveEvent ) : void {
        this.eventHandler( eventName , event );
    }

    public eventHandler( name : string , event : MouseActiveEvent ) : void {


        const fake : Entity = new Entity()

        let action = {

            target : this.scene , 
            mouseDown : false , 
            screen : new Vector3 ,
            location : new Vector3 ,

            drag : {
                target : fake , 
                current: new Vector3,
                prev : new Vector3
            }
            
        };

        action.screen = new Vector3( event.originEvent.x , event.originEvent.y );
        action.location = event.painterLocation;
        action.drag.current = event.painterLocation;

        interface _Temp {
            index : number ,
            shape : Shape 
        };

        let path : Array< _Temp >  = new Array< _Temp >();

        let queue = SystemBase.EntityBuffer.getOrderedData();
        console.log( queue.length )

        for( let i = queue.length - 1 ; i >= 0 ; --i ){

            let cache = queue[ i ];
            console.log( cache )
            // let touched = isTouch( cache , action.location );
            // if( touched ){
                // path.push( { index : cache.ref.index , shape : cache.ref } );
            // }

        }
/*
        path.push( { index : -1 , shape : CanvasPainter } );

        if( path.length <= 0 ) return ;

        let top : _Temp = path[0];
        let topTarget : Shape = top.shape ;
        
        
        for( let i = 0 ; i < path.length ; ++ i ){
            
            top = path[i];
            let target = top.shape;
            if( target.hasEvent( name ) ){
                
                event.target = topTarget;
                target.trigger( name , event );
                break;

            }
        }

        // default function
        if( name == 'mousedown' ){

            action.mouseDown = true;
            action.drag.target = topTarget;

        }else if( name == 'mousemove' ){

            if( action.drag.target != null &&  action.drag.target != fake ){

                let current = action.drag.current.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.transform.inverseTransformWorld );
                let prev = action.drag.prev.multiply( painter.inverseTransformScreen ).multiply( action.drag.target.transform.inverseTransformWorld );
                
                let delta = current.sub( prev );
                
                action.drag.target.transform.translate( delta );
            
            }

        }else if( name == 'mouseup' ){

            action.drag.target = fake;

        }

        action.drag.prev = action.drag.current;
*/
    }

    

}

export { ActiveEvent ,  MouseActiveEvent , EventListener  , EventType , EventSystem }