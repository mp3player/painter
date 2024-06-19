import { ShapeComponent } from "./shape.js";


class Grid extends ShapeComponent{

    private _interval : number  = 10 ;



    public set interval( _interval : number ){
        this._interval = _interval;
    }

    public get interval() {
        return this._interval;
    }


}


export { Grid }