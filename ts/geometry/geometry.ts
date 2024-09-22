import { Vector3 } from "../math/vector.js";

enum GeometryType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT };

class Geometry {

    private _name : string ;
    private _uuid : string ;

    public get name(){
        return this._name;
    }

    public set name( _name : string ){
        this._name = _name;
    }

    public get uuid(){
        return this._uuid;
    }

    public set uuid( _uuid : string ){
        this._uuid = _uuid;
    }

    public get shapeType() { return GeometryType.SHAPE; }

    constructor(){ }

    getPoints() : Array< Vector3 > {
        return new Array< Vector3 > ();
    };

}

export { Geometry , GeometryType }