import { Entity } from "../entity";


abstract class Component {

    protected _entity : Entity | null;          // the entity of this component attached to;
    protected _name : string                    // the name of the component 
    protected _needUpdate : boolean = true;     // indicathe whether the data belonging to this component has been changed;
    protected _visible : boolean = false;       // indicate whether the component is visible , which will affect the event system
    private _renderable : boolean = true;       // indicate whether the component can be rendered

    public get needUpdate(){
        return this._needUpdate;
    }

    public get name(){
        return this._name;
    }

    public set entity( shape : Entity ){
        this._entity = shape;
    }

    public get entity( ){
        return this._entity;
    }

    public set visible( _visible : boolean ){
        this._visible = _visible;
    }

    public get visible(){
        return this._visible;
    }

    protected set renderable( _renderable : boolean ){
        this._renderable = _renderable
    }

    public get renderable( ){
        return this._renderable;
    }

    constructor( name : string = "Default Component" ){
        this._name = name;
        this._entity = null;
    }

    public attachTo( entity : Entity ) : void {
        this.entity = entity;
        this._needUpdate = true;
    }

    public abstract update( deltaTime : number  ) : void ;

};


export { Component }