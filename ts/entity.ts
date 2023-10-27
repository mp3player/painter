import { ArrayList } from "./collection.js";
import { BoxComponent, CircleComponent, Component , TransformComponent } from "./component.js";
import { RendererComponent } from "./render.js";
import { Tool } from "./util.js";

class Entity {

    
    public components : Map< string , Component > = new Map< string , Component >();
    public transform : TransformComponent = new TransformComponent( 'transform' );
    protected _index : number;
    protected _uuid : string;

    public children : ArrayList< Entity > = new ArrayList< Entity >;
    public parent : Entity;

    public set index( _index : number ) { this._index = _index; }

    public get index( ) { return this._index ;}

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

        this.components.set( component.name , component );
        component.entity = this;
        
    }

    hasComponent( name : string ) : boolean {

        return this.components.has( name );

    }

    findComponent( name : string ) : Component | any {
        
        if( this.hasComponent( name ) ){
            return this.components.get( name );
        }
        return null;

    }

    removeComponent( name : string ) : boolean {

        if( this.hasComponent( name ) ) {
            return this.components.delete( name );
        }
        return false;

    }

}


export { Entity }