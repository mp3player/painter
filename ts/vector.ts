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

class Vector{

    public x : number;
    public y : number;

    constructor( x : number = 0 , y : number = 0 ){
        this.x = x;
        this.y = y;
    }

    squareLength() : number {
        return this.x * this.x + this.y * this.y;
    }

    length() : number {
        return hypot(this.x , this.y);
    }

    equal( v : Vector ) : boolean {
        return (this.x == v.x) && (this.y == v.y)
    }

    normalize() : Vector {
        let len = this.length();

        if(len != 0){
            return this.scale( 1 / len );
        }

        return new Vector();
    }

    add( v : Vector ) : Vector {
        return new Vector( this.x + v.x , this.y + v.y );
    }

    sub( v : Vector ) : Vector {
        return new Vector( this.x - v.x , this.y - v.y );
    }

    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    applyTransform( mat : Matrix  ) : Vector {
        let v0 = mat.data[0] * this.x + mat.data[3] * this.y + mat.data[6] * 1;
        let v1 = mat.data[1] * this.x + mat.data[4] * this.y + mat.data[7] * 1;
        let v3 = mat.data[2] * this.x + mat.data[5] * this.y + mat.data[8] * 1;

        if(v3 == 0){
            throw new Error(" the (x,y) of the vector is infinity");
        }else{
            v0 /= v3;
            v1 /= v3;
            return new Vector(v0,v1);
        }

    }

    scale( factor : number ) : Vector {
        return new Vector( this.x * factor , this.y * factor );
    }

    dot( v : Vector ) : number {
        return this.x * v.x + this.y * v.y;
    }

    clone() : Vector {
        return new Vector(this.x , this.y);
    }

    toString( ) : string {
        return `{ x: ${ this.x } , y: ${ this.y } }`
    }

    static Addition( v0 : Vector , v1 :Vector) : Vector { 
        return v0.add(v1);
    }

    static Substraction( v0 : Vector , v1 : Vector ) : Vector {
        return v0.sub( v1 );
    }

    static SquaDist(v0 : Vector , v1 : Vector ) : number {
        return v1.sub(v0).squareLength();
    }

    static Dist(v0 : Vector , v1 : Vector ) : number {
        return v1.sub(v0).length();
    }

    /**
     * r  : i , j , k
     * v0 : x , y , 1
     * v1 : x , y , 1
     */
    static Direction(v0 : Vector , v1 : Vector ) : number {
        // let x = v0.y - v1.y;
        // let y = v1.x - v0.x;
        let w = v0.x * v1.y - v0.y * v1.x;
        return w;
    }

    static Equal( v0 : Vector , v1 : Vector ) : boolean {
        return ( v0.x == v1.x && v0.y == v1.y ) ;
    }

    static X : Vector = new Vector(1,0);
    static Y : Vector = new Vector(0,1);

}

// column-wise element 
/**
 * | x0 , x3 , x6 |
 * | x1 , x4 , x7 |
 * | x2 , x5 , x8 |
 */
class Matrix{
    
    public data : Array<number>;

    constructor(
            x0 = 1 , x1 = 0 , x2 = 0,
            x3 = 0 , x4 = 1 , x5 = 0,
            x6 = 0 , x7 = 0 , x8 = 1
        ){
        this.data = [x0,x1,x2,x3,x4,x5,x6,x7,x8];
    }
    // ele-wise add
    add(mat : Matrix) : Matrix {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] + mat.data[i]);
        }

        return new Matrix( ...data );
    }

    // ele-wise sub
    sub(mat : Matrix) : Matrix {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] - mat.data[i]);
        }

        return new Matrix( ...data );
    }

    // ele-wise mul
    mul(mat : Matrix) : Matrix {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] * mat.data[i]);
        }

        return new Matrix( ...data );
    }

    // mat multiply by scalar
    scalar( factor  : number) : Matrix {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] * factor );
        }

        return new Matrix( ...data );
    }

    transpose( ) : Matrix {
        let data = this.data;
        return new Matrix( data[0] , data[3] , data[6] , data[1] , data[4] , data[7] , data[2] , data[5] , data[8] );
    }

    // compute the determination of the matrix
    // unfold the matrix according to the row
    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    det() : number{
        let data = this.data;
        let d0 = data[4] * data[8] - data[5] * data[7];
        let d1 = data[1] * data[8] - data[2] * data[7];
        let d2 = data[1] * data[5] - data[2] * data[4];

        return data[0] * d0 - data[1] * d1 + data[2] * d2;
    }

    // A*
    // compute the value by the row => place the value by the column 
    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    adjugate() : Matrix {
        let data = this.data;

        let x0 = data[4] * data[8] - data[5] * data[7];
        let x1 = data[1] * data[8] - data[2] * data[7];
        let x2 = data[1] * data[5] - data[2] * data[4];

        let x3 = data[3] * data[8] - data[5] * data[6];
        let x4 = data[0] * data[8] - data[2] * data[6];
        let x5 = data[0] * data[5] - data[2] * data[3];

        let x6 = data[3] * data[7] - data[4] * data[6];
        let x7 = data[0] * data[7] - data[1] * data[6];
        let x8 = data[0] * data[4] - data[1] * data[3];

        return new Matrix( x0 , -x1 , x2 , -x3 , x4 , -x5 , x6 , -x7 , x8 );
    }

    // compute the inverse of the matrix
    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    inverse() : Matrix {
        let d = this.det();

        if( d == 0 ) throw new Error(' this matrix is not reversible');

        let A = this.adjugate();
        return A.scalar( 1 / d );
    }

    // clone the matrix
    clone() : Matrix {
        return new Matrix( ...this.data );
    }


    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    static Multiply( mat1 : Matrix , mat2 : Matrix ) : Matrix {
        let data : Array<number> = []
        // plain matrix multiplication 
        for(let i = 0 ; i < 3 ; ++ i){ // row
            for(let j = 0 ; j < 3 ; ++ j){ // col
                let d = 0
                for(let k = 0 ; k < 3 ; ++ k){ // ele
                    d += mat1.data[k * 3 + j] * mat2.data[i * 3 + k]
                }
                data.push(d);
            }
        }
        
        return new Matrix(...data);
    }

    /**
     * 0 , 3 , 6(x)
     * 1 , 4 , 7(y)
     * 2 , 5 , 8
     */
    static Translate( mat : Matrix , t : Vector ) : Matrix {
        let res = mat.clone()
        let data = res.data;

        data[6] += t.x;
        data[7] += t.y;

        return res;
    }

    /**
     * 0(c)  , 3(-s) , 6
     * 1(s)  , 4(c)  , 7
     * 2     , 5     , 8
     */
    static Rotate( mat : Matrix , a : number ) : Matrix {
        let res = mat.clone();
        let rotationMatrix = new Matrix( cos(a) , sin(a) , 0 , -sin(a) , cos(a) , 0 );
        res = Matrix.Multiply(rotationMatrix , res);

        return res;
    }

    /**
     * 0(x) , 3 , 6
     * 1 , 4(y) , 7
     * 2 , 5 , 8
     */
    static Scale( mat : Matrix , s : Vector) : Matrix {
        let res = mat.clone();

        res.data[0] *= s.x;
        res.data[3] *= s.x;
        res.data[6] *= s.x;

        res.data[1] *= s.y;
        res.data[4] *= s.y;
        res.data[7] *= s.y;

        return res;
    }

    static LinearTransform( mat : Matrix ) : Matrix {
        let d0 = mat.data[0] , d1 = mat.data[1] , d3 = mat.data[3] , d4 = mat.data[4];3
        return new Matrix( d0 , d1 , 0 , d3 , d4 , 0 , 0 , 0 , 1 );
    }

    static Equal( mat0 : Matrix , mat1 : Matrix ) : boolean {
        for( let i = 0 ; i < 9 ; ++ i ){
            if( mat0.data[i] != mat1.data[i] ) return false;
        }
        return true;
    }

    static TransformSequence( mat : Matrix , seq : Array< Vector > ) : Array< Vector > {
        let result : Array<Vector> = new Array<Vector>;
        for( let i = 0 ; i < seq.length ; ++ i ){
            result.push( seq.at( i ).applyTransform( mat ) );
        }
        return result;
    }

}

export {Complex , Vector , Matrix}