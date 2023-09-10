class Node{
    private _element: any = null;
    private _prev: Node | null = null;
    private _next: Node | null = null;

    public get element(): any {
        return this._element;
    }
    public set element(value: any) {
        this._element = value;
    }

    public get prev(): Node | null {
        return this._prev;
    }
    public set prev(value: Node | null) {
        this._prev = value;
    }

    public get next(): Node | null {
        return this._next;
    }
    public set next(value: Node | null) {
        this._next = value;
    }

    
    constructor(value : any){
        this.element = value;
    }
}

// Sequential Colllection
abstract class List{

    protected _length: number = 0;

    public get length(): number {
        return this._length;
    }
    // add
    abstract add(v : any) : void

    //insert
    abstract insert( i : number , v : any ) : void

    // delete
    abstract remove(i : number) : void

    // get
    abstract get(i : number) : void

    // set 
    abstract set(i : number , v : any) : void

    // iterator
    abstract forEach(handler : any) : void

    // find
    abstract find(v : any) : number;

    // status
    isEmpty() : boolean {
        return this.length == 0;
    }

    // clear the collection
    abstract clear() : void 

}

class LinkedList extends List{

    private root : any;
    private rear : any;

    constructor(){
        super();
        this.root = null;
        this.rear = null;
    }
    
    // implement List.add
    add(v : any) : void {
        v = new Node(v);
        if(this.root == null){
            this.root = this.rear = v;
        }else{
            v.prev = this.rear;
            this.rear.next = v;
            this.rear = v;
        }
        this._length += 1;
    }

    // implement List::insert
    // TODO : need to be tested
    insert( i : number , v : any ) : void {
        let node = this.get( i );
        if( node == null ){
            // can't find the value given i
            // add the value to the end of the list
            this.add( v );
        }else{
            // link the prev and next 
            let newNode = new Node(v);
            newNode.prev = node;
            newNode.next = node.next;
            node.next.prev = newNode;
            node.next = newNode;
        }
    }

    // implement List::delete
    remove(i : number) : any {

        if(i >= this._length)
            return null;

        let node : any = this.get(i);
        if(node != null){
            let prev : any = node.prev;
            let next : any = node.next;

            if(prev != null)
                prev.next = next;

            if(next != null)
                next.prev = prev;

            this._length -= 1;
            return node.element;
        }

        return node;
        
    }

    // implement List::get
    get(i : number) : any {
        if(i >= this._length) return null;

        let k = 0;
        let node : any = this.root;

        while(k < i && node.next != null){
            node = node.next;
            k += 1;
        }

        return node;
    }
    // implement List::set 
    set(i : number , v : any ) : void {

        let node : any = this.get(i);

        if(node != null){
            node.element = v;
        }

    }

    // iterator
    forEach(handler : any) : void {

        let node : any = this.root;
        let i = 0;

        while(node != null){
            handler(node , i);
            node = node.next;
            i += 1;
        }

    }

    find(v : any) : number{

        return -1;
    }


    clear(): void {
        this.root = null;
        this.rear = null;
    }
}

class ArrayList extends List{

    private data : Array<any>;

    constructor(){
        super();
        this.data = [];
    }
    
    // add
    add(v : any) : void {
        this.data.push(v);
        this._length += 1;
    }

    insert(i: number, v: any): void {
        this.data.splice(i , 0 , v);
    }

    // delete
    remove(i : number) : any {
        if(i < this.length){
            let v = this.data.splice(i,1);
            this._length -= 1;
            return v;
        }
    }


    // get
    get(i : number) : any {
        return this.data[i];
    }

    // set 
    set(i : number , v : any ) : void {
        this.data[i] = v;
    }

    // iterator
    forEach(handler : any) : void {
        this.data.forEach(handler);
    }

    find( v : any ) : number {
        return -1;
    }

    clear(): void {
        this.data = [];
        this._length = 0;
    }
}

class Stack {
    public data : Array<any>;
    private _length : number = 0;

    public get length() : number {
        return this._length;
    }

    constructor(){
        this.data = [];
    }

    push(v : any) : void {
        this.data.push(v);
        this._length += 1;
    }

    top() : any {
        if(!this.isEmpty()){
            return this.data.at(-1)
        }else{
            return null;
        }

    }

    pop() : boolean{
        if(!this.isEmpty()){
            this.data.splice(-1,1);
            this._length -= 1;
            return true;
        }else{
            return false;
        }
    }

    // status
    isEmpty() : boolean { 
        return this.length == 0;
    }

    // clear the collection
    clear() : void {
        this.data = [];
        this._length = 0;
    }
}
  
interface TreeNode{
    vlaue : any , 
    left : any , 
    right : any
};

abstract class Tree {

    public root : TreeNode | null;
    public _size : number;
    public get size( ){
        return this._size;
    }

    constructor( ){
        this.root = null;
        this._size = 0;
    }

}

class AVLTree extends Tree {

    add( value : any ) : TreeNode {
        return null;
    }

    remove( value : any ) : boolean {
        return false;
    }

    find( value : any ) : TreeNode {
        return null;
    }

}

class TreeMap extends Tree {

    constructor(){
        super();
    }


}

export {LinkedList , ArrayList , Stack}