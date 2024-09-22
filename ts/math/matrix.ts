import { Vector3 } from "./vector.js";



const cos = Math.cos;
const sin = Math.sin;
const hypot = Math.hypot
const pow = Math.pow;

class Matrix {

};

class Matrix3{
    
    public data : Array<number>;

    constructor(
            x0 = 1 , x1 = 0 , x2 = 0,
            x3 = 0 , x4 = 1 , x5 = 0,
            x6 = 0 , x7 = 0 , x8 = 1
        ){
        this.data = [x0,x1,x2,x3,x4,x5,x6,x7,x8];
    }
    // ele-wise add
    add(mat : Matrix3) : Matrix3 {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] + mat.data[i]);
        }

        return new Matrix3( ...data );
    }

    // ele-wise sub
    sub(mat : Matrix3) : Matrix3 {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] - mat.data[i]);
        }

        return new Matrix3( ...data );
    }

    // ele-wise mul
    mul(mat : Matrix3) : Matrix3 {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] * mat.data[i]);
        }

        return new Matrix3( ...data );
    }

    // mat multiply by scalar
    scalar( factor  : number) : Matrix3 {
        let data : Array<number> = [];

        for(let i = 0 ; i < 9 ; ++ i){
            data.push(this.data[i] * factor );
        }

        return new Matrix3( ...data );
    }

    transpose( ) : Matrix3 {
        let data = this.data;
        return new Matrix3( data[0] , data[3] , data[6] , data[1] , data[4] , data[7] , data[2] , data[5] , data[8] );
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
    adjugate() : Matrix3 {
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

        return new Matrix3( x0 , -x1 , x2 , -x3 , x4 , -x5 , x6 , -x7 , x8 );
    }

    // compute the inverse of the matrix
    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    inverse() : Matrix3 {
        let d = this.det();

        if( d == 0 ) throw new Error(' this matrix is not reversible');

        let A = this.adjugate();
        return A.scalar( 1 / d );
    }

    // clone the matrix
    clone() : Matrix3 {
        return new Matrix3( ...this.data );
    }


    /**
     * 0 , 3 , 6
     * 1 , 4 , 7
     * 2 , 5 , 8
     */
    static Multiply( mat1 : Matrix3 , mat2 : Matrix3 ) : Matrix3 {
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
        
        return new Matrix3(...data);
    }

    /**
     * 0 , 3 , 6(x)
     * 1 , 4 , 7(y)
     * 2 , 5 , 8
     */
    static Translate( mat : Matrix3 , t : Vector3 ) : Matrix3 {
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
    static Rotate( mat : Matrix3 , a : number ) : Matrix3 {
        let res = mat.clone();
        let rotationMatrix = new Matrix3( cos(a) , sin(a) , 0 , -sin(a) , cos(a) , 0 );
        res = Matrix3.Multiply(rotationMatrix , res);

        return res;
    }

    /**
     * 0(x) , 3 , 6
     * 1 , 4(y) , 7
     * 2 , 5 , 8
     */
    static Scale( mat : Matrix3 , s : Vector3) : Matrix3 {
        let res = mat.clone();

        res.data[0] *= s.x;
        res.data[3] *= s.x;
        res.data[6] *= s.x;

        res.data[1] *= s.y;
        res.data[4] *= s.y;
        res.data[7] *= s.y;

        return res;
    }

    static LinearTransform( mat : Matrix3 ) : Matrix3 {
        let d0 = mat.data[0] , d1 = mat.data[1] , d3 = mat.data[3] , d4 = mat.data[4];3
        return new Matrix3( d0 , d1 , 0 , d3 , d4 , 0 , 0 , 0 , 1 );
    }

    static Equal( mat0 : Matrix3 , mat1 : Matrix3 ) : boolean {
        for( let i = 0 ; i < 9 ; ++ i ){
            if( mat0.data[i] != mat1.data[i] ) return false;
        }
        return true;
    }

    static TransformSequence( mat : Matrix3 , seq : Array< Vector3 > ) : Array< Vector3 > {
        let result : Array<Vector3> = new Array<Vector3>;
        for( let i = 0 ; i < seq.length ; ++ i ){
            result.push( seq.at( i ).applyTransform( mat ) );
        }
        return result;
    }

}


export { Matrix3 }