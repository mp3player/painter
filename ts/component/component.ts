import { Entity } from "../entity";


abstract class Component {

    protected _entity : Entity | null;
    protected _name : string 
    protected _needUpdate : boolean = true;

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

    constructor( name : string = "Default Component" ){
        this._name = name;
        this._entity = null;
    }

    public attachTo( entity : Entity ) : void {
        this.entity = entity;
        this._needUpdate = true;
    }

    public abstract updateOnce( deltaTime : number ) : void ;

    public updateFix() : void {
        this.updateOnce( 0.0 );
    }

    public update( deltaTime : number ) {
        this.updateOnce( deltaTime );
    }



};


export { Component }