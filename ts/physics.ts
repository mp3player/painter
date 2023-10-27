import { Component } from "./component.js";
import { SystemBase } from "./system.js";
import { Vector } from "./vector.js";


class RigidComponent extends Component{

    private force : Vector ;
    private smoothness : number ;
    private mass : number;
    
    

    public constructor( name : string  ){
        super( name )
    }

    public addForce( force : Vector ) : void {
        this.force = force;
    }

    public reset() : void {
        this.force = new Vector();
    }

    public update( deltaTime: number ): void {
        
    }

}


class PhysicsSystem extends SystemBase {

    public update(deltaTime: number): void {
        // collision detection 
        // force process 
    }
    
}

export { RigidComponent , PhysicsSystem }