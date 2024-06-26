import { GMath } from "./math.js";
import { Matrix3 } from "./matrix.js";
import { Vector3 } from "./vector.js";



class Geometry {

    /**
     * find a ear in a polygon
     * @param edge vertex of the given polygon
     * @param anti vertex order of the polygon : clock wise or anti-clock wise 
     * @returns 
     */
    static FindEar( edge : Array< Vector3 > , anti : boolean  ) : Array< number >{
        
        if( edge.length == 3 ) return [ 0 , 1 , 2 ];

        for( let i = 0 ; i < edge.length ; ++ i ){

            let prevIndex : number = ( i - 1 + edge.length ) % edge.length;
            let currentIndex : number = i ;
            let nextIndex : number = ( i + 1 ) % edge.length;

            let v0 = edge.at( currentIndex ).sub( edge.at( prevIndex ) );
            let v1 = edge.at( nextIndex ).sub( edge.at( currentIndex ) );

            if( anti == true && Vector3.Direction( v0 , v1 ) < 0 ) continue;
            else if( anti == false && Vector3.Direction( v0 , v1) > 0 ) continue; 

            let triangle : Array< Vector3 > = [ edge.at( prevIndex ) , edge.at( currentIndex ) , edge.at( nextIndex ) ];
            
            let isEar : boolean = true;
            for( let j = 0 ; j < edge.length ; ++ j ){

                if( j == prevIndex || j == currentIndex || j == nextIndex ) {
                    continue;
                } 
                
                if( GMath.IsPointInPolygon( triangle , edge.at( j ) ) ){
                    // this is not a ear
                    isEar = false;
                    break;
                }

            }

            if( isEar == true ){
                return [ prevIndex , currentIndex , nextIndex ];
            }

        }

    }

    /**
     * triangulation algorithm implemented by ear algorithm
     * @param path , point set need to be triangulate polygon
     * @param anti , the same as the FindEar's anti parameter
     * @returns 
     */
    static Triangulate( path : Array< Vector3 > , anti = true ) : Array< Array< Vector3 > >{

        // clone 
        let edge : Array< Vector3 > = [];

        for( let i = 0 ; i < path.length ; ++ i ){
            edge.push( path.at( i ).clone() );
        }
        
        let triangles : Array< Array< Vector3 > > = [];
        let i = 0;
        while( edge.length >= 3 ){
            // console.log( edge )
            let ear = Geometry.FindEar( edge , anti );
            triangles.push( [ edge.at( ear[0] ) , edge.at( ear[1] ) , edge.at( ear[2] ) ] );
            // delete 
            edge.splice( ear[1] , 1 );
            
        }

        return triangles;
        
    }

    /**
     * GJK algorithm implementation
     * @param poly0 
     * @param poly1 
     */
    static GJKDetection( poly0 : Array< Vector3 > , poly1 : Array< Vector3 > ){

        // 1.random direction
        // 2.compute furthest point => ensure direction
        // 3.compute normal
        

    }

    /**
     * 
     * @param A is a point of a triangle
     * @param B is a point of a triangle
     * @param C is a point of a triangle
     * @param P is a point represented by the a, b and c
     * @returns the coordinate coefficient corresponding to the a, b and c
     */
    static ConvertToBaryCentricCoordinate( A : Vector3 , B : Vector3 , C : Vector3 , P : Vector3 ) : Vector3 {
        
        let AB : Vector3 = B.sub( A );
        let AC : Vector3 = C.sub( A );
        let AP : Vector3 = P.sub( A );

        let k1 = AP.dot( AB ) / AB.squareLength();
        let k2 = AP.dot( AC ) / AC.squareLength();

        return new Vector3( 1 - k1 - k2 , k1 , k2 );

    }

}

enum ShapeType { SHAPE , PATH  , ARC , CIRCLE , ELLIPSE , RECTANGLE , POLYGON , TEXT };

class Shape {

    private _name : string ;
    private _uuid : string ;

    public get name(){
        return this._name;
    }

    public set name( _name : string ){
        this._name = _name;
    }

    public get uuid(){
        return this._uuid;
    }

    public set uuid( _uuid : string ){
        this._uuid = _uuid;
    }

    public get shapeType() { return ShapeType.SHAPE; }

    constructor(){ }

    getPoints() : Array< Vector3 > {
        return new Array< Vector3 > ();
    };

}

class Path extends Shape {

    public points : Array<Vector3>;

    public get shapeType() { return ShapeType.PATH; }

    constructor( ){
        super();
        this.points = new Array<Vector3>();
    }

    append( point : Vector3 ){
        this.points.push( point );
    }

    getPoints() : Array< Vector3 > {
        return this.points;
    };

}

class Arc extends Shape {
    
    public from : number;
    public to : number; 
    public radius : number; 
    public startAngle : number ;
    public endAngle : number;

    public get shapeType() { return ShapeType.ARC; }

    constructor( startAngle : number = 0.0 , endAngle : number = 90.0 , radius : number = 100){

        super();

        this.startAngle = startAngle * Math.PI / 180;
        this.endAngle = endAngle * Math.PI / 180;
        this.radius = radius;
        
    }

    getPoints() : Array< Vector3 > {
        
        // TODO : step should be calculated according the radius and the transform matrix
        let step : number = Math.floor( Math.PI * this.radius / 4 );
        let stride : number = ( this.endAngle - this.startAngle ) / step;
        let points : Array< Vector3 > = new Array< Vector3 >();

        for( let i = 0 ; i < step ; ++ i ){
            let x : number = Math.cos( i * stride ) * this.radius;
            let y : number = Math.sin( i * stride ) * this.radius;
            points.push( new Vector3( x , y ) );
        }
        
        return points;
    
    };

}

class Circle extends Arc{

    public get shapeType() { return ShapeType.CIRCLE; }

    constructor( r = 1 ){
        super(0 , 360 , r);
    }

}

class Ellipse extends Shape {

    public a : number;
    public b : number;

    public get shapeType() { return ShapeType.ELLIPSE; }

    constructor( a = 1 , b = 1 ){
        super();
        this.a = a;
        this.b = b;
    }

    getPoints() : Array< Vector3 > {
        let mat : Matrix3 = new Matrix3( this.a , 0, 0, 0, this.b, 0, 0, 0, 1 );
        let step : number = Math.floor( Math.PI * 2 * Math.sqrt( this.a * this.b ) );
        let stride : number = Math.PI * 2 / step;
        let edge : Array< Vector3 > = new Array< Vector3 >;

        for( let i = 0 ; i < step ; ++i ){
            edge.push( new Vector3( Math.cos( i * stride ) , Math.sin( i * stride ) ).applyTransform( mat ) );
        }

        return edge;
    };


};

class Rectangle extends Shape{

    public width : number;
    public height : number;

    public get shapeType() { return ShapeType.RECTANGLE; }

    constructor( width : number , height : number , x = 0 , y = 0 ){
        super();
        this.width = width;
        this.height = height;
    }

    getPoints() : Array< Vector3 > {
        
        let hw : number = this.width / 2;
        let hh : number = this.height / 2;
        
        return [
            new Vector3( -hw , -hh ),
            new Vector3(  hw , -hh ),
            new Vector3(  hw ,  hh ),
            new Vector3( -hw ,  hh ),
        ];

    };

}

class Polygon extends Shape{
    
    public points : Array<Vector3>;

    public get shapeType() { return ShapeType.POLYGON; }

    constructor( points : Array<Vector3>){
        super();
        this.points = points;
    }

    append( vertex : Vector3 ){

        this.points.push( vertex );

    }

    getPoints() : Array< Vector3 > {
        return this.points;
    };


}

class Convex extends Polygon{

    constructor( points : Array<Vector3> ){
        points = GMath.GetConvex( points );
        super( points );
    }


}

class QuadraticBezierCurve extends Path{

    public p0 : Vector3;
    public p1 : Vector3;
    public p2 : Vector3;

    constructor( p0 : Vector3 , p1 : Vector3 , p2 : Vector3 ){
        super();
        this.p0 = p0 ;
        this.p1 = p1 ;
        this.p2 = p2 ;
    }

    getPoints() : Array< Vector3 > {
        return new Array< Vector3 > ();
    };


}

class Text extends Shape {
    
    public text : string ;
    public fontSize : number;
    public _size : number ;
    public _family : string;

    public _baseline : string ;

    public get shapeType() { return ShapeType.TEXT; }

    public get size(){ return this._size ;}

    public get family(){ return this._family; }

    public get baseline(){
        return this._baseline;
    }

    public set size( size : number ) { 
        this._size = size;
    }

    public set baseline( _baseline : string ) { 
        this._baseline = _baseline ;
    }

    public set family( family : string ) { 
        this._family = family;
    }
    
    constructor( text : string ){
        super( );
        this.text = text;
        this.fontSize = 10;
    }

}



export { Geometry , Shape , Path , Arc , Circle , Ellipse , Rectangle , Polygon , Convex , QuadraticBezierCurve , ShapeType ,Text }