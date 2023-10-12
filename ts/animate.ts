import { ArrayList } from './collection.js';
import { Tool } from './util.js'
import { Color } from './style.js'
import { Vector } from './vector.js';


type BlendFunction = ( percent : number  ) => number;

const DefaultBlendFunction : BlendFunction = ( w : number ) => { return w ; }


class Animate<T> {
    
    protected _source : T;
    protected _target : T;
    protected _value : T;
    protected _duration : number;
    protected _delay : number;
    protected _blend : string ;
    protected _blendFunction : BlendFunction = DefaultBlendFunction; 
    protected _name : string = "default animation";

    // TODO : _cache is used in fixed step animation
    protected _cache : boolean ;
    protected _finished : boolean;
    protected _isRunning : boolean;
    protected _id : string = Tool.UUID();

    public get finished(){
        return this._finished;
    }

    public get isRunning(){
        return this._isRunning;
    }

    public get id(){
        return this._id;
    }

    public constructor( 

        start : T , 
        end : T , 
        duration : number ,
        delay : number , 
        cache : boolean = false ,
        blend : string ,
        name : string

    ){

        this._source = start ;
        this._target = end; 
        this._value = start;
        this._duration = duration;
        this._delay = delay;
        this._blend = blend;
        this._name = name;

        this.init();

        this._cache = cache;
        this._finished = false;
        this._isRunning = false;

    }

    protected init () : void {

        switch( this._blend ){

            case 'linear' : {
                
                this._blendFunction = DefaultBlendFunction;

            }break;
        }

        // TODO : cache data is used in fixed step animation 

    }

    public start() : void {
        this._isRunning = true;
    }

    // TODO : overwrite
    public update( w : number ) : void {}

    getCurrentValue() : T {

        return this._value;

    }

}

class AnimateNumber extends Animate<number> {

    public update( w : number ) : void {
        this._value = ( this._target - this._source ) * this._blendFunction( w ) + this._source ;
    }

}

class AnimateColor extends Animate< Color > {

    public update( w : number ) : void {

        let offset : Color = this._target.sub( this._source );
        let r = this._blendFunction( w ) * offset.r + this._source.r;
        let g = this._blendFunction( w ) * offset.g + this._source.g;
        let b = this._blendFunction( w ) * offset.b + this._source.b;

        this._value = new Color( r , g , b );

    } 

}

class AnimateVector extends Animate< Vector > {

    public update( w : number ) : void {

        let offset : Vector = this._target.sub( this._source );
        let x = this._blendFunction( w ) * offset.x + this._source.x;
        let y = this._blendFunction( w ) * offset.y + this._source.y;

        this._value = new Vector( x , y );

    }

}


class Animation {


    private sequence : any ;

    public constructor(){

    }


};

export { Animate , Animation }