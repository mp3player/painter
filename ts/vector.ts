import { Matrix3 } from './matrix.js'



const cos = Math.cos;
const sin = Math.sin;
const hypot = Math.hypot
const pow = Math.pow;

class Complex {
    public real : number;
    public imag : number;
    constructor( real : number = 0 , imag : number = 0 ){
        this.real = real;
        this.imag = imag;
    }
    add( complex : Complex ) : Complex {
        return new Complex( this.real + complex.real , this.imag + complex.imag );
    }
    sub( complex : Complex ) : Complex {
        return new Complex( this.real - complex.real , this.imag - complex.imag );
    }
    mul( complex : Complex ) : Complex {
        let real = this.real * complex.real - this.imag * complex.imag
        let imag = this.real * complex.imag + complex.real * this.imag;
        return new Complex( real , imag );
    }
    length() : number {
        return hypot( this.real , this.imag );
    }
    conjugate( ) : Complex {
        return new Complex( this.real , -this.imag );
    }
    scale( factor : number ) : Complex {
        return new Complex( this.real * factor , this.imag * factor );
    }
    div( complex : Complex ) : Complex {
        return this.mul( complex.conjugate() ).scale( 1.0 / pow( complex.length() , 2 ) );
    }
    // TODO
    toMatrix() : void {

    }
    clone() : Complex {
        return new Complex( this.real , this.imag );
    }
    static Euler( angle : number ) : Complex {
        return new Complex( cos(angle) , sin(angle) );
    }

    
}

class Vector3{

    public x : number;
    public y : number;
    public z : number = 1;

    constructor( x : number = 0 , y : number = 0 , z : number = 1 ){
        this.x = x;
        this.y = y;
        this.z = z;
    }

    squareLength() : number {
        return this.x * this.x + this.y * this.y;
    }

    length() : number {
        return hypot(this.x , this.y);
    }

    equal( v : Vector3 ) : boolean {
        return (this.x == v.x) && (this.y == v.y)
    }

    normalize() : Vector3 {
        let len = this.length();

        if(len != 0){
            return this.scale( 1 / len );
        }

        return new Vector3();
    }

    add( v : Vector3 ) : Vector3 {
        return new Vector3( this.x + v.x , this.y + v.y );
    }

    sub( v : Vector3 ) : Vector3 {
        return new Vector3( this.x - v.x , this.y - v.y );
    }

    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    // TODO : vector is 2-d , the 3rd row should be 1;
    applyTransform( mat : Matrix3  ) : Vector3 {
        let v0 = mat.data[0] * this.x + mat.data[3] * this.y + mat.data[6] * 1;
        let v1 = mat.data[1] * this.x + mat.data[4] * this.y + mat.data[7] * 1;
        // let v3 = mat.data[2] * this.x + mat.data[5] * this.y + mat.data[8] * 1; 

        return new Vector3(v0,v1);

    }

    scale( factor : number ) : Vector3 {
        return new Vector3( this.x * factor , this.y * factor );
    }

    reverse() : Vector3 {
        return this.scale( -1 );
    }

    perpendicular() : Vector3 {
        return new Vector3( this.y , this.x );
    }

    dot( v : Vector3 ) : number {
        return this.x * v.x + this.y * v.y;
    }

    clone() : Vector3 {
        return new Vector3(this.x , this.y);
    }

    toString( ) : string {
        return `{ x: ${ this.x } , y: ${ this.y } }`
    }

    static Addition( v0 : Vector3 , v1 :Vector3) : Vector3 { 
        return v0.add(v1);
    }

    static Substraction( v0 : Vector3 , v1 : Vector3 ) : Vector3 {
        return v0.sub( v1 );
    }

    static SquaDist(v0 : Vector3 , v1 : Vector3 ) : number {
        return v1.sub(v0).squareLength();
    }

    static Dist(v0 : Vector3 , v1 : Vector3 ) : number {
        return v1.sub(v0).length();
    }

    /**
     * r  : i , j , k
     * v0 : x , y , 1
     * v1 : x , y , 1
     */
    static Direction(v0 : Vector3 , v1 : Vector3 ) : number {
        // let x = v0.y - v1.y;
        // let y = v1.x - v0.x;
        let w = v0.x * v1.y - v0.y * v1.x;
        return w;
    }

    static Equal( v0 : Vector3 , v1 : Vector3 ) : boolean {
        return ( v0.x == v1.x && v0.y == v1.y ) ;
    }

    static GetNormal( v0 : Vector3 , v1 : Vector3 ) : Vector3 {

        let normal : Vector3 = new Vector3( v0.y - v1.y , v1.x - v0.x );

        return normal;

    }

    static O : Vector3 = new Vector3(0,0);
    static X : Vector3 = new Vector3(1,0);
    static Y : Vector3 = new Vector3(0,1);

}

// column-wise element 
/**
 * | x0 , x3 , x6 |
 * | x1 , x4 , x7 |
 * | x2 , x5 , x8 |
 */


export {Complex , Vector3 }