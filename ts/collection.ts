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

const defaultComparer : Function = ( a : any , b : any ) => {

    if( a == b ) return 0;
    else if( a < b ) return 1;
    return -1;
    
}

class TreeNode< T , S >{

    public key : T ;
    public value : S ;
    public parent : TreeNode<T , S>  | null ;
    public left : TreeNode<T , S > ;
    public right : TreeNode<T , S> 
    
    constructor( key : T , value : S  ) {
        this.key = key;
        this.value = value ;
        this.parent = null;
        this.left = null;
        this.right = null;
    }

};

abstract class Tree<T , S> {

    public root : TreeNode<T , S> | null;


    private comp : Function;
    private _size : number;

    public get size( ){
        return this._size;
    }

    constructor( comp : Function = defaultComparer ){
        this.root = null;
        this.comp = comp;
        this._size = 0;
    }

    add( key : T , value : S ) : boolean {

        if( this.find( key ) != null ){
            this.set( key , value );
            return false;
        }

        if( this.root == null ) {
            this.root = new TreeNode<T , S>( key , value );
            return true;
        }

        let newNode : TreeNode<T , S> = new TreeNode<T , S>( key , value );
        let node : TreeNode<T , S> = this.root;
        let p : TreeNode<T , S> = node;
        
        while( node != null ){
            p = node;
            if( this.comp( newNode.key , node.key ) >= 0 ){
                node = node.left;
            }else{
                node = node.right;
            }
        }

        if( this.comp( newNode.key , p.key ) >= 0 ){
            p.left = newNode;
        }else{
            p.right = newNode;
        }
        newNode.parent = newNode;
        this._size += 1;
        return true;

    }

    remove( key : T ) : boolean {
        // remove the node & rebuild the tree 
        // 1. the deleted node is a leaf node => delete this node directly
        // 2. the deleted node is the root node => delete this node & set the root as null
        // 3. the deleted node is a node with child and parent => delete this node & transplant

        if( this._size <= 0 ) return false;

        let node = this.find( key );
        if( node == null ) return false;

        if( node.left == null ){

            // has no left child
            this.transplant( node.right , node );

        }else if( node.right == null ){

            // has no right child
            this.transplant( node.left , node );

        }else{
            // has both left and right child 
            // the next must be a child of node
            let next = this.next( node );
            
            if( next == null ){
                // this node must have a next
                throw Error('fatal error');
            }else{
                // the next has no left children;
                // place the next.right at the next 
                if( next != node.right ){
                    this.transplant( next.right , next );
                    next.right = node.right;
                    next.parent = node.parent;
                }
                this.transplant( next ,node );
                // replace the next with node
                next.left = node.left;
                node.left.parent = next;


            }
        }

        this._size -= 1;

    }

    set( key : T , value : S ) : boolean {
        let node = this.find( key );
        if( node != null ){
            node.value = value;
            return true;
        }
        return false;
    }

    get( key : T ) : S {
        let node = this.find( key );
        if( node == null ) return null;
        return node.value;
    }

    has( key : T ) : boolean {
        let node = this.find( key );
        return node != null;
    }

    // in-order traverse
    keys() : Array< T > { 

        let arr : Array< T > = new Array< T > ();

        let fn : Function = ( node : TreeNode < T , S > ) => {
            if( node == null ) return ;
            
            fn( node.left );
            arr.push( node.key );
            fn( node.right );
        }
        
        fn( this.root );

        return arr;

    }

    clear() : void {
        this.root = null;
        this._size = 0;
    }

    // TODO : prevet hash occlide
    private find( key : T ) : TreeNode <T , S> {
        let node : TreeNode <T , S > = this.root;
        while( node != null ){
            if( node.key == key ) return node;
            if( this.comp( key , node.key ) >= 0 ){
                node = node.left;
            }else{
                node = node.right;
            }
        }
        return null;
    }

    // WARNING : target.parent will disconnect with target
    // this function will remove the tree whose root is target 
    // and place the source at the position of target
    private transplant( source : TreeNode<T , S> , target : TreeNode<T , S>  ) : void {
        

        
        // transplant a node from source to target
        // place source at target 

        if( target.parent == null ){
            // target is root
            this.root = source;
        }else if( target = target.parent.left ){
            target.parent.left = source;
        }else{
            target.parent.right = source;
        }

        if( source != null)
            source.parent = target.parent;
        
    }

    private next( node : TreeNode<T , S> ) : TreeNode<T , S> {
        
        // the next is a node which is the smallest one but larger than this node.
        // 1. the next of a node is the leftest in it's right child tree

        // this node has right child
        if( node.right != null ){
            node = node.right;
            while( node.left != null ){
                node = node.left;
            }
        }else {
            // this node has no right child
            let p = node.parent;
            while( p != null && node == p.left ){
                node = p ;
                p = node.parent;
            }

        }

        return node;
    }

    private prev( node : TreeNode<T , S > ) : TreeNode<T , S>{
        
        // the prev of a node which is the largest one but smaller than this node
        // 1. the prev of a node is the leftest node in it's left child tree
        // 2. 
        if( node.left != null ){
            node = node.left;
            while( node.right != null ){
                node = node.right;
            }
        }else{
            let p = node.parent;
            while( p != null && p.right == node ){
                node = p ;
                p = node.parent;
            }
        }
        return node;
    }



}

class AVLTree<T , S> extends Tree<T , S> {

    add( key : T , value : S ) : boolean  {
        return super.add( key , value );
    }

}

export {LinkedList , ArrayList , Stack , Tree }