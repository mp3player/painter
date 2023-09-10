

class QuadNode {

    public left : number;
    public right : number;
    public top : number;
    public bottom : number;

    public leftTop : Array< QuadNode >
    public rightTop : Array< QuadNode >
    public leftBottom : Array< QuadNode >
    public rightBottom : Array< QuadNode >

    constructor( left , right , top , bottom ){

        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;

    }
}

class QuadTree {

    public left : number;
    public right : number;
    public top : number;
    public bottom : number;
    
    public root : QuadNode;
    
    constructor( left : number , right : number , top : number , bottom : number ){
        
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.root = new QuadNode( left , right , top , bottom );

    }

}