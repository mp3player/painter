import { Vector } from "./vector.js";

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
    protected  _originEvent : UIEvent;
    public target : EventListener | null
    
    public get originEvent(){
        return this._originEvent;
    }


    constructor( event : UIEvent ){
        this._originEvent = event;
        this.target = null;
    }
}


// read-only properties
class MouseActiveEvent extends ActiveEvent{

    private _name : EventType;               // the name  
    private _painterLocation : Vector;
    private _screenLocation : Vector ;
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
        location : Vector
    ){
        super( event )
        this._name = name ;
        this._painterLocation = location.clone();
        this._screenLocation = new Vector( event.x , event.y );
        this.paths = [];
    }

}

class KeyActiveEvent extends ActiveEvent {
    
};

class EventListener{

    public registedEvent : Map<string ,any>;
    public handler : any;
    public dragable : boolean;

    constructor(){
        this.registedEvent = new Map();
        this.handler = {};
        this.dragable = false;
    }
    
    on( eventName : string , callback : any ) : void {
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


export { ActiveEvent ,  MouseActiveEvent , EventListener  , EventType }