

// TODO finish template

class Node< T >{
    private _element: T = null;
    private _prev: Node<T> | null = null;
    private _next: Node<T> | null = null;

    public get element(): any {
        return this._element;
    }
    public set element(value: T) {
        this._element = value;
    }

    public get prev(): Node<T> | null {
        return this._prev;
    }
    public set prev(value: Node<T> | null) {
        this._prev = value;
    }

    public get next(): Node<T> | null {
        return this._next;
    }
    public set next(value: Node<T> | null) {
        this._next = value;
    }

    
    constructor(value : T){
        this.element = value;
    }
}

// Sequential Colllection
abstract class List < T >{

    protected _length: number = 0;

    public get length(): number {
        return this._length;
    }
    // add
    abstract add(v : T) : void

    //insert
    abstract insert( i : number , v : T ) : void

    // delete
    abstract remove(i : number) : T | null

    // get
    abstract get(i : number) : T

    // set 
    abstract set(i : number , v : T) : void

    // iterator
    abstract forEach(handler : Function) : void

    // find
    abstract find(v : T) : number;

    // status
    isEmpty() : boolean {
        return this.length == 0;
    }

    // clear the collection
    abstract clear() : void 

}

class LinkedList<T> extends List<T>{

    private root : any;
    private rear : any;

    constructor(){
        super();
        this.root = null;
        this.rear = null;
    }
    
    // implement List.add
    add(v : T) : void {
        let newNode = new Node<T>(v);
        if(this.root == null){
            this.root = this.rear = newNode;
        }else{
            newNode.prev = this.rear;
            this.rear.next = newNode;
            this.rear = newNode;
        }
        this._length += 1;
    }

    // implement List::insert
    // TODO : need to be tested
    insert( i : number , v : T ) : void {
        let node = this.get( i );
        if( node == null ){
            // can't find the value given i
            // add the value to the end of the list
            this.add( v );
        }else{
            // link the prev and next 
            let newNode = new Node<T>(v);
            newNode.prev = node;
            newNode.next = node.next;
            node.next.prev = newNode;
            node.next = newNode;
        }
    }

    // implement List::delete
    remove(i : number) : T | null {

        if(i >= this._length)
            return null;

        let node : Node<T> = this.get(i);
        if(node != null){
            let prev : Node<T> = node.prev;
            let next : Node<T> = node.next;

            if(prev != null)
                prev.next = next;

            if(next != null)
                next.prev = prev;

            this._length -= 1;
            return node.element;
        }

        return node.element;
        
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

class ArrayList<T> extends List<T>{

    private data : Array<T>;

    constructor(){
        super();
        this.data = [];
    }
    
    // add
    add(v : T) : void {
        this.data.push(v);
        this._length += 1;
    }

    insert(i: number, v: T): void {
        this.data.splice(i , 0 , v);
    }

    // delete
    remove(i : number) : T | null {
        if(i < this.length){
            let v : Array<T> = this.data.splice(i,1);
            this._length -= 1;
            return v[0];
        }
        return null;
    }


    // get
    get(i : number) : T {
        return this.data[i];
    }

    // set 
    set(i : number , v : T ) : void {
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

class Stack<T> {
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

type _Comp<T> = ( a : T , b : T ) => number ;

const defaultComparer : _Comp<any> = ( a : any , b : any ) => {
    if( a - b > 0 ) return 1 ;
    else if( a == b ) return 0 ;
    return -1;
}

// TODO
class PriorityQueue<T> {
    
    private data : Array< T > ;
    private orderedData : Array< T >
    private _length : number ;
    private comparer : _Comp<T>
    private _needUpdate = true;

    public get length() {

        return this._length;

    }

    constructor( comparer : _Comp<T> = defaultComparer ){
        this._length = 0;
        this.data = new Array<T>;
        this.comparer = comparer;
        this.orderedData = [];
    }

    public push( v : T ) : void {

        this.data.push( v );
        this._length += 1;
        this.shiftUp( this._length - 1 );
        this._needUpdate = true;

    }

    public top( ) : T {
        if( this._length <= 0 ) return null;
        return this.data.at( 0 );
    }

    public pop( ) : Boolean {
        
        if( this._length <= 0 ){
            return false;
        }
        this.swap( 0 , this._length - 1 );
        this.data.pop();
        this._length -= 1;
        this.shiftDown( 0 );
        this._needUpdate = true;
        return true;

    }

    public isEmpty() : Boolean {
        return this._length == 0;
    }

    public clear() : void {
        this._length = 0;
        this.data = new Array<T>();
        this._needUpdate = true;
    }

    private shiftUp( index : number ) : void {
        if( index > 0 ){
            let p : number = Math.floor( ( index - 1 ) / 2 ) ;
            if( this.comparer( this.data.at( p ) , this.data.at( index ) ) >= 0 ){
                this.swap( p , index );
                this.shiftUp( p );
            }
        }
    }

    private shiftDown( index : number ) : void {
        
        let c : number = index * 2 + 1;
        if( c < this._length ){
            
            if( c + 1 < this._length && this.comparer( this.data.at( c ) , this.data.at( c + 1 ) ) >= 0 ){
                c += 1;
            }

            if( this.comparer( this.data.at( index ) , this.data.at( c ) ) >= 0 ){
                    
                this.swap( c , index );
                this.shiftDown( c );
            
            }
        }
    }

    private swap( aIndex : number , bIndex : number ) : void {
        let a = this.data.at( aIndex );
        let b = this.data.at( bIndex );
        this.data[aIndex] = b;
        this.data[bIndex] = a;
    }

    /**
     * name
     */
    public getOrderedData( ) : Array< T >  {
        
        if( this._needUpdate ){

            let copiedData : Array< T > = [];
            for( let i = 0 ; i < this.length ; ++ i ){
                copiedData.push( this.data[i] );
            }

            this.orderedData = [];

            while( !this.isEmpty() ){
                this.orderedData.push( this.top() );
                this.pop();
            }

            this.data = copiedData;
            this._length = copiedData.length ;
        }

        return this.orderedData;

    }

}


export {LinkedList , ArrayList , Stack , PriorityQueue }