import { Component } from "../component.js";
import { Style } from "../../style.js";



abstract class Renderer extends Component {
    
    public style : Style = new Style();

    constructor( name : string = 'Default RenderComponent'){
        super( name );
        this.renderable = true;
    }

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

    public update( deltaTime : number ) : void {

    }

}

export { RendererComponent }