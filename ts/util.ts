import { Stack } from "./collection.js";
import { GMath } from "./math.js";
import { Complex , Vector3 } from "./vector.js";

const _lut = ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"]


// the basic method 
class Tool{


    static UUID() : string {
        const d0 = Math.random() * 0xffffffff | 0;
        const d1 = Math.random() * 0xffffffff | 0;
        const d2 = Math.random() * 0xffffffff | 0;
        const d3 = Math.random() * 0xffffffff | 0;
        const uuid = _lut[ d0 & 0xff ] + _lut[ d0 >> 8 & 0xff ] + _lut[ d0 >> 16 & 0xff ] + _lut[ d0 >> 24 & 0xff ] + '-' +
                _lut[ d1 & 0xff ] + _lut[ d1 >> 8 & 0xff ] + '-' + _lut[ d1 >> 16 & 0x0f | 0x40 ] + _lut[ d1 >> 24 & 0xff ] + '-' +
                _lut[ d2 & 0x3f | 0x80 ] + _lut[ d2 >> 8 & 0xff ] + '-' + _lut[ d2 >> 16 & 0xff ] + _lut[ d2 >> 24 & 0xff ] +
                _lut[ d3 & 0xff ] + _lut[ d3 >> 8 & 0xff ] + _lut[ d3 >> 16 & 0xff ] + _lut[ d3 >> 24 & 0xff ];
    
        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();
    }

    static Minkowski( conv1 : Array<Vector3>  , conv2 : Array<Vector3> , mode = 'diff' ) : Array<Vector3>{
        
        let shape : Array<Vector3> = [];
        for(let i = 0 ; i < conv1.length ; ++ i){
            for(let j = 0 ; j < conv2.length ; ++ j){
                if(mode == 'diff'){
                    let p = conv2[j].sub( conv1[i] );
                    shape.push(p)
                }else{
                    let p = conv2[j].add( conv1[i] );
                    shape.push(p)
                }
                
            }
        }
        shape = GMath.GetConvex(shape);
        return shape;
    }

    
    static LinearInterpolate( p0 : Vector3 , p1 : Vector3 , w = 0) : Vector3 {
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;

        return new Vector3(p0.x + dx * w , p0.y + dy * w);
    }

    static getObjectType( object : Object ) : string {
        return Object.prototype.toString.call( object );
    }

    static isArray( object : Object ) : boolean {
        return Tool.getObjectType( object ) == '[object Array]'
    }

    static isString( object : Object ) : boolean {
        return Tool.getObjectType( object ) == '[object String]'
    }

    static isNumber( object : Object ) : boolean {
        return Tool.getObjectType( object ) == '[object Number]'
    }

    static isBoolean( object : Object ) : boolean {
        return Tool.getObjectType( object ) == '[object Boolean]'
    }
    

    static DFT( singnal : Array< number  > ) : Array< number | Complex > {
        
        let _signal = new Array< Complex >();
        for( let i = 0 ; i < singnal.length ; ++ i ){
            _signal.push( new Complex( singnal[i] ) )
        }

        let freq = new Array< Complex >();
        let N = _signal.length;

        for( let i = 0 ; i < N ; ++ i ){
            let w = new Complex();
            for( let j = 0 ; j < N ; ++ j ){
                w = w.add( _signal[j].mul( Complex.Euler( -2 * Math.PI * i * j / N ) ) )
            }
            freq.push( w );
        }

        return freq;
    }

    static IDFT( freq : Array< Complex >) : Array< Complex > {
        let signal = new Array< Complex >();
        let N = freq.length;

        for( let i = 0 ; i < N ; ++ i ){
            let w = new Complex();
            for( let j = 0 ; j < N ; ++ j ){
                w = w.add( freq[j].mul( Complex.Euler( 2 * Math.PI * i * j / N ) ) )
            }
            signal.push( w.scale( 1 / N ) );
        }
        return signal
    }

    static FFT( signal : Array< number > ) : Array< Complex > {
        let _signal = new Array< Complex > ();
        for( let i = 0 ; i < signal.length ; ++ i ){
            _signal.push( new Complex( signal[i] ) );
        }
        // let power = Math.ceil( Math.log2( signal.length ) );
        // let N = Math.pow( 2 , power );

        // if( signal.length < N ){
        //     for( let i = signal.length ; i < N ; ++ i ){
        //         _signal.push( new Complex );
        //     }
        // }

        let _fft : ( sig:Array<Complex> )=>Array<Complex> = function( sig ) {
            let N = sig.length;
            if( N == 1 ) return sig;
            let even = sig.filter((d,i) => {
                if( i % 2 == 0 )return true;
                return false;
            })
            let odd = sig.filter((d,i) => {
                if( i % 2 == 1) return true;
                return false;
            })

            let y0 : Array<Complex> = _fft(even);
            let y1 : Array<Complex> = _fft(odd);
            let wn = Complex.Euler(-2 * Math.PI / N);
            let w = new Complex(1);
            let y = new Array<Complex>(N).fill(new Complex);
            for( let k = 0 ; k < N / 2 ; ++k ){
                y[k] = y0[k].add( w.mul( y1[k] ) );
                y[k + N / 2] = y0[k].sub( w.mul( y1[k] ) );
                w = w.mul( wn );
            }
            return y
        }
        return _fft(_signal);
    } 

    // TODO : discrete cosine transform algirithm 
    static DCT( signal : Array< number > , version : number = 1 ) {

        type dct = ( x : Array< number > )=>Array< number >
        let pow = Math.pow;
        let cos = Math.cos;

        let dct1 : dct = ( x ) => {
            let N = x.length;
            let X = new Array< number >();
            let X0 = (x[0] + x.at(-1)) / 2;
            X.push(X0);
            for( let k = 1 ; k < x.length ; ++ k ){
                let Xk = (x[0] + pow(-1,k) * x.at(-1));
                for( let n = 1 ; n < x.length ; ++ n ){
                    Xk += x[n] * cos( Math.PI / (N - 1) * k * n );
                }
                X.push( Xk );
            }
            return X;
        }

        let dct2 : dct = ( x ) => {
            let N = x.length;
            let X = new Array< number >();
            for( let k = 0 ; k < x.length ; ++ k ){
                let Xk = 0;
                for( let n = 0 ; n < x.length ; ++ n ){
                    Xk += x[n] * cos( Math.PI / N * k * ( n + .5 ) );
                }
                X.push( Xk );
            }
            return X;
        }

        let dct3 : dct = ( x ) => {
            return x;
        }

        let dct4 : dct = ( x ) => {
            return x;
        }

        switch( version ){
            case 1 : return dct1( signal );
            case 2 : return dct2( signal );
            case 3 : return dct3( signal );
            case 4 : return dct4( signal );
        }

    }

}


class Ray {

    private origin : Vector3;
    private direction : Vector3;

    constructor( origin : Vector3  , direction : Vector3 ){
        this.origin = origin;
        this.direction = direction;
    }

}

class Box{
    
    public top : number;
    public right : number;
    public bottom : number;
    public left : number;

    constructor(top = 0 , right = 0 ,bottom = 0 , left = 0){
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }

    // point + box
    merge( point : Vector3 ) : void {
        
        let top : number = this.top , 
        right : number = this.right , 
        bottom : number = this.bottom , 
        left : number = this.left ;

        if( point.x < this.left ){
            left = point.x;
        }
        if( point.x > this.right ){
            right = point.x;
        } 
        if( point.y < this.bottom ){
            bottom = point.y;
        }
        if( point.y > this.top ){
            top = point.y;
        }

        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;

    }

    // box + box
    add(box : Box) : Box {
        return Box.add(box,this);
    }

    reset() : void{
        this.top = 0;
        this.right = 0;
        this.bottom = 0;
        this.left = 0;
    }

    updateBoundary( top : number , right : number , bottom : number , left : number ){
        if( top > this.top ) this.top = top;
        if( right > this.right ) this.right = right;
        if( bottom < this.bottom ) this.bottom = bottom;
        if( left < this.left ) this.left = left;
    }

    getBorder() : Array< Vector3 > {
        return [ 
            new Vector3( this.left , this.top ) , 
            new Vector3( this.left , this.bottom ) , 
            new Vector3( this.right , this.bottom ) , 
            new Vector3( this.right , this.top ) 
        ];
    }

    clone() : Box {
        return new Box( this.top , this.right , this.bottom , this.left );
    }

    // box1 * box2
    static intersection( box1 : Box , box2 : Box ) : Box {
        let top = box1.top < box2.top ? box1.top : box2.top;
        let right = box1.right < box2.right ? box1.right : box2.right;
        let bottom = box1.bottom > box2.bottom ? box1.bottom : box2.bottom;
        let left = box1.left > box2.left ? box1.left : box2.left;

        return new Box(top,right,bottom,left);
    }

    // static box1 + box2
    static add(box1 : Box , box2 : Box ) : Box {
        let top = box1.top > box2.top ? box1.top : box2.top;
        let right = box1.right > box2.right ? box1.right : box2.right;
        let bottom = box1.bottom < box2.bottom ? box1.bottom : box2.bottom;
        let left = box1.left < box2.left ? box1.left : box2.left;

        return new Box(top,right,bottom,left);
    }

}

class Circle {

    public center : Vector3;
    public r : number;

    constructor( center : Vector3 , r : number ){
        this.center = center;
        this.r = r;
    }

    getBorder() : Array< Vector3 > {
        let edge : Array < Vector3 > = [];

        let step : number = Math.ceil( Math.PI * 2 * this.r );
        let stride : number = Math.PI * 2 / step;

        for( let i = 0 ; i < step ; ++ i ){
            edge.push( new Vector3( Math.cos( i * stride ) , Math.sin( i * stride ) ).scale( this.r ).add( this.center ) );
        }

        return edge;
    }


}

export {Tool , Ray , Box , Circle}