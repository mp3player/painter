import { Shape } from "./shape"


abstract class Helper {

    protected _shape : Shape;

    public get shape(){
        return this._shape;
    }

    constructor( shape : Shape ){
        this._shape = shape;
    }

}

class BoxHelper extends Helper {

    constructor( shape : Shape ){
        super(shape);
    }


}




export { Helper , BoxHelper  }