import { Circle } from "../util.js";
import { Vector3 } from "../vector.js";
import { BoxComponent } from "./box.js";
import { RendererComponent } from "./render.js";

class CircleComponent extends RendererComponent {

    public circle : Circle;

    constructor( name : string = "Default BorderCircleComponent" ){
        super( name );
    }

    public updateOnce( deltaTime : number ) : void {}

}

export { CircleComponent }