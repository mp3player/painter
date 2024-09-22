import { Geometry, GeometryType } from "./geometry";


class Text extends Geometry {
    
    public text : string ;
    public fontSize : number;
    public _size : number ;
    public _family : string;

    public _baseline : string ;

    public get shapeType() { return GeometryType.TEXT; }

    public get size(){ return this._size ;}

    public get family(){ return this._family; }

    public get baseline(){
        return this._baseline;
    }

    public set size( size : number ) { 
        this._size = size;
    }

    public set baseline( _baseline : string ) { 
        this._baseline = _baseline ;
    }

    public set family( family : string ) { 
        this._family = family;
    }
    
    constructor( text : string ){
        super( );
        this.text = text;
        this.fontSize = 10;
    }

}

export { Text }