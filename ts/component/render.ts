import { Component } from "./component.js";
import { Style } from "../style.js";



abstract class Renderer extends Component {
    
    public style : Style = new Style();

}

class RendererComponent extends Renderer {

    protected _visible : boolean = false;

    public get visible() {
        return this._visible;
    }

    public set visible( _visible : boolean ) {
        this._visible = _visible;
    }

    constructor( name : string = "Default ShapeRendererComponent" ){
        super( name );
    }

    public updateOnce( deltaTime : number ) : void {

    }

}

export { RendererComponent }