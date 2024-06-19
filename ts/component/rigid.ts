import { Vector3 } from "../vector";
import { Component } from "./component";

class RigidComponent extends Component{

    private force : Vector3 ;
    private smoothness : number ;
    private mass : number;

    public constructor( name : string  ){
        super( name )
    }

    public addForce( force : Vector3 ) : void {
        this.force = force;
    }

    public reset() : void {
        this.force = new Vector3();
    }

    public updateOnce( deltaTime: number ): void {
        
    }

}

export { RigidComponent }