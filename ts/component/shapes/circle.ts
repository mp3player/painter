import { Circle } from "../../utils/util.js";
import { Vector3 } from "../../math/vector.js";
import { BoxComponent } from "./box.js";
import { RendererComponent } from "../render/render.js";

class CircleComponent extends RendererComponent {

    public circle : Circle;

    constructor( name : string = "Default BorderCircleComponent" ){
        super( name );
        this.renderable = true;
    }

    public update( deltaTime : number ) : void {

    }

}

export { CircleComponent }