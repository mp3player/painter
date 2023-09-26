



const defaultComparer : Function = ( a : any , b : any ) => {

    if( a == b ) return 0;
    else if( a < b ) return 1;
    return -1;
    
}

class TreeNode< T , S >{

    public key : T ;
    public value : S ;
    public parent : TreeNode<T , S>  | null ;
    public left : TreeNode<T , S > | null ;
    public right : TreeNode<T , S> | null ;
    public factor : number ;
    public symbol : Boolean ;
    
    constructor( key : T , value : S  ) {
        this.key = key;
        this.value = value ;
        this.parent = null;
        this.left = null;
        this.right = null;
        this.factor = 0;
        this.symbol = TreeNode.BLACK;
    }

    static RED = true;
    static BLACK = false;

};

abstract class TreeMap<T , S> {

    public root : TreeNode<T , S> | null;


    protected comp : Function;
    protected _size : number;

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
            if( this.comp( key , node.key ) >= 0 ){
                node = node.left;
            }else{
                node = node.right;
            }
        }

        if( this.comp( key , p.key ) >= 0 ){
            p.left = newNode;
        }else{
            p.right = newNode;
        }
        newNode.parent = p;
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

    lft() : Array< T > {
        let nodes : Array< TreeNode<T , S> > = new Array< TreeNode<T , S> > ();
        let keys : Array< T > = new Array< T >();
    
        nodes.push( this.root );

        while( nodes.length > 0 ){
            let node = nodes.splice(0,1)[0];
            
            if( node.left != null ) nodes.push( node.left );
            if( node.right != null ) nodes.push( node.right );
            keys.push( node.key );
        }

        return keys;
    };

    clear() : void {
        this.root = null;
        this._size = 0;
    }

    // TODO : prevet hash occlide
    protected find( key : T ) : TreeNode <T , S> {
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
    protected transplant( source : TreeNode<T , S> , target : TreeNode<T , S>  ) : void {
        

        
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

    protected next( node : TreeNode<T , S> ) : TreeNode<T , S> {
        
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

    protected prev( node : TreeNode<T , S > ) : TreeNode<T , S>{
        
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

class AVLTreeMap<T , S> extends TreeMap<T , S> {

    add( key : T , value : S ) : boolean  {
        
        if( super.has( key ) ){
            super.set( key , value );
            return false;
        }

        let newNode : TreeNode<T , S> = this.put( key , value );

        // rebalance
        // check wheter the newNode could break the balance
        // update balance factor 
        
        let node : TreeNode<T , S> = newNode.parent;
        while( node != null ){
            let ld = this.depth( node.left );
            let rd = this.depth( node.right );
            node.factor = ld - rd;
            if( node.factor <= -2 || node.factor >= 2 ){
                this.rebalance( node );
            }
            node = node.parent;
        }


        return true;

    }

    depth( node : TreeNode< T , S > ) : number {
    
        let fn : Function = ( node : TreeNode<T , S > ) : number => {
            if( node == null ) return 0;

            let lDepth = fn( node.left );
            let rDepth = fn( node.right );
            return lDepth > rDepth ? lDepth + 1 : rDepth + 1;
        
        }

        return fn( node );
    
    }

    rotateLeft( node : TreeNode<T , S> ) : void {
        
        let r : TreeNode<T , S> = node.right;

        node.right = r.left;
        if( r.left != null ){
            r.left.parent = node;
        }
        
        if( node.parent == null ){
            this.root = r;
        }else if ( node == node.parent.left ){
            node.parent.left = r;
        }else{
            node.parent.right = r;
        }
        r.left = node;
        r.parent = node.parent;
        node.parent = r;

    }

    rotateRight( node : TreeNode<T , S> ) : void {
        
        let l : TreeNode<T , S> = node.left;

        node.left = l.right;
        if( l.right != null ){
            l.right.parent = node;
        }
        
        if( node.parent == null ){
            this.root = l;
        }else if( node == node.parent.left ){
            node.parent.left = l;
        }else{
            node.parent.right = l;
        }

        l.parent = node.parent;
        l.right = node;
        node.parent = l;


    }

    rebalance( node : TreeNode<T , S> ) : void {

        if( node.factor >= 2 ){
            // the depth of left is lager than the right
            
            if( node.left.factor > 0 ){
                // condition 1 : left + left
                this.rotateRight( node );
            } else{
                // condition 2 : left + right
                this.rotateLeft( node.left );
                this.rotateRight( node );
            }
            
        }else if( node.factor <= -2 ){
            // the depth of right is lager than the left
            if( node.right.factor < 0 ){
                // condition 1 : right + right;
                this.rotateLeft( node );
            }else{
                // condition 2 : right + left ;
                this.rotateRight( node.right );
                this.rotateLeft( node );
            }
            
            
        }
        // TODO : update the factor of node which is moved
        node.factor = this.depth( node.left ) - this.depth( node.right );

    }

    // add the node to the tree and keep it balance
    private put( key : T , value : S ) : TreeNode<T , S > {
        
        let newNode : TreeNode<T , S> = new TreeNode<T , S>( key , value );

        if( this.root == null ){
            this.root = newNode;
            return newNode;
        }

        let node : TreeNode<T , S> = this.root;
        let p : TreeNode<T , S>;
        while( node != null ){
            p = node;
            if( this.comp( key , node.key ) >= 0 ){
                node = node.left;
            }else{
                node = node.right;
            }
        }

        if( this.comp( key , p.key ) >= 0 ){
            p.left = newNode;
        }else{
            p.right = newNode;
        }
        newNode.parent = p;
        newNode.factor = 0;
        return newNode;

    }


}



export { TreeMap , AVLTreeMap }