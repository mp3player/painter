import { ArrayList } from "./container/list/collection.js";
import { CircleComponent } from "./component/shapes/circle.js";
import { Component } from "./component/component.js";
import { RendererComponent } from "./component/render/render.js";
import { TransformComponent } from "./component/transform.js";
import { Tool } from "./utils/util.js";


class Entity {

    public components : ArrayList< Component > = new ArrayList< Component >();
    public transform : TransformComponent = new TransformComponent( 'transform' );

    protected _uuid : string;
    public index : number = 1;    
    public name : string = 'entity';

    public children : ArrayList< Entity > = new ArrayList< Entity >;
    public parent : Entity;

    public get uuid() { return this._uuid ; };

    constructor( ){

        this._uuid = Tool.UUID();
        this.addComponent( this.transform ) ;
        this.addComponent( new RendererComponent( 'renderer' ) ) ;
        this.addComponent( new CircleComponent('box') );
        
    }

    add( shape : Entity ) : void { 

        this.children.add(shape);
        shape.parent = this;

    }

    remove( uuid : string ) : Entity | null {
        for( let i = 0 ; i < this.children.length ; ++ i ){
            if( this.children.get(i).uuid == uuid ){
                return this.children.remove( i );
            }
        }
        return null;
    }
    
    // component related
    addComponent( component : Component ) : void {

        this.components.add( component );
        component.attachTo( this );
        
    }

    findComponentByClass( componentClass : any ) : any {
        for( let i = 0 ; i < this.components.length ; ++ i  ){
            if( this.components.get( i ) instanceof componentClass ) return this.components.get( i );
        }
    }

    findComponentsByClass( componentClass : any ) : Array<any>  {
        let result : Array< any > = []
        for( let i = 0 ; i < this.components.length ; ++ i  ){
            if( this.components.get( i ) instanceof componentClass ) {
                result.push( this.components.get( i ) )
            }
        }
        return result;
    }

    findComponentByName( name : string ) : Component | any {
        for( let i = 0 ; i < this.components.length ; ++ i  ){
            if( this.components.get( i ).name == name ) {
                return this.components.get( i );
            }
        }
        return null;
    }

    removeComponentByName( name : string ) : boolean {
        let deleteIndex = -1;
        for( let i = 0 ; i < this.components.length ; ++ i  ){
            if( this.components.get( i ).name == name ) {
                deleteIndex = i;
                break;
            }
        }
        return deleteIndex >= 0
    }

}


export { Entity }