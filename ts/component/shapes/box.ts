import { Entity } from "../../entity.js";
import { Color } from "../../style.js";
import { Box } from "../../utils/util.js";
import { Component } from "../component.js";

class BoxComponent extends Component {

    public box : Box;
    private width : number = 0 ;
    private height : number = 0;

    constructor( name : string = "Default BorderBoxComponent" ){
        super( name );
        this.renderable = true;
        this.box = new Box();
    }

    public setSize( width : number , height : number ) : void {
        this.width = width;
        this.height = height;
        this.box.updateBoundary( height / 2 , width / 2 , - height / 2 , -width / 2 );
    }

    public update( deltaTime : number ) : void {}

}

export { BoxComponent }