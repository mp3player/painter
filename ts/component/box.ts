import { Entity } from "../entity.js";
import { Color } from "../style.js";
import { Box } from "../util.js";
import { Component } from "./component.js";

class BoxComponent extends Component {

    public box : Box;
    public borderColor : Color = Color.Black;
    public borderWidth : number = 1;
    public borderDash : number = 0;
    private width : number = 0 ;
    private height : number = 0;

    constructor( name : string = "Default BorderBoxComponent" ){
        super( name );
        this.box = new Box();
    }

    public setSize( width : number , height : number ) : void {
        this.width = width;
        this.height = height;
        this.box.updateBoundary( height / 2 , width / 2 , - height / 2 , -width / 2 );
    }

    // TODO : override 
    // [ render | process ] the box of the shape this component attached to
    public updateOnce( deltaTime : number ) : void {

    }

}

export { BoxComponent }