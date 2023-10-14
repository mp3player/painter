import { Stack } from "./collection.js";
import { Complex , Vector } from "./vector.js";



// the basic method 
class Tool{

    static UUID() : string {
        let _lut = Tool._lut;
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

    static getSlop( v0 : Vector , v1 : Vector ) : number {
        if( v0.x == v1.x ) return Number.POSITIVE_INFINITY;
        return ( v1.y - v0.y ) / ( v1.x - v0.x );
    }

    static isLineIntersected( p0 : Vector , p1 : Vector , p2 : Vector , p3 : Vector  ) : boolean {

        // l0 => p0 : upper , p1 : lower
        // l1 => p2 : upper , p3 : lower
        
        let v0 = p2.sub(p1); // ( l1->upper - l0->lower , 1.0f );
        let v1 = p0.sub(p2)//( l0->upper - l1->upper , 1.0f );
        let v2 = p3.sub(p0)//( l1->lower - l0->upper , 1.0f );
        let v3 = p1.sub(p3)//( l0->lower - l1->lower , 1.0f );
    
        let c0z : number = Vector.Direction(v0,v1);
        let c1z : number = Vector.Direction(v1,v2);
        let c2z : number = Vector.Direction(v2,v3);
        let c3z : number = Vector.Direction(v3,v0);
    
        if( c0z > 0 && c1z > 0 && c2z > 0 && c3z > 0 || c0z < 0 && c1z < 0 && c2z < 0 && c3z < 0 ){
            return true;
        }
        return false;
    }

    static IsPointInCircle( center : Vector , radius : number  , point : Vector ) : boolean {

        let dis = Vector.SquaDist(center , point);
        if(dis > radius * radius)
            return false;
        return true;

    }

    static IsPoingInEllipse( a : number , b : number , point : Vector ) : boolean {
        return false;
    }

    static isPointInLine( p0 : Vector , p1 : Vector , point : Vector , eps = 1.0 ) : boolean {

        if( p0.x == p1.x ){
            // vertical line
            let min = p0.y > p1.y ? p1.y : p0.y;
            let max = p0.y > p1.y ? p0.y : p1.y;
            if( point.y > min - eps && point.y < max + eps && point.x > p0.x - eps && point.y < p0.x - eps ) return true;
            return false; 
        }

        let min = p0.x > p1.x ? p1.x : p0.x;
        let max = p0.x > p1.x ? p0.x : p1.x;

        if( point.x < min - eps || point.y > max + eps  ) return false;

        let k = ( p1.y - p0.y ) / ( p1.x - p0.x );
        let b = p0.y - k * p0.x;
        let y = k * point.x + b;
        let error = y - point.y;
        if( error * error < eps * eps )return true;

        return false;

    }

    static isPointInPath( edge : Array< Vector > , point : Vector , eps = 1.0) : boolean {
        for( let i = 1 ; i < edge.length ; ++i ){
            if( this.isPointInLine( edge[ i - 1 ] , edge[i] , point , eps ) ) return true;
        }
        return false;
    }

    static IsPointInRect( edge : Array<Vector> , point : Vector ) : boolean {

        let left = edge[0].x , right = edge[0].x , top = edge[0].y , bottom = edge[0].y;
        for( let i = 1 ; i < edge.length ; ++ i ){
            let vertex = edge[i];
            if( left > vertex.x ) left = vertex.x ;
            else if( right < vertex.x ) right = vertex.x ;

            if( top < vertex.y ) top = vertex.y;
            else if ( bottom > vertex.y ) bottom = vertex.y;

        }

        return ( point.x >= left && point.x <= right && point.y >= bottom && point.y <= top)
    }

    static IsPointInPolygon( edge : Array<Vector> , point : Vector  ) : boolean {

        let count = edge.length;
        let flag = false;
        for(let i = 0 , j = count - 1  ; i < count ; j = i ++){
            let p0 = edge[j] ; 
            let p1 = edge[i];

            if( (point.x - p0.x) * (point.x - p1.x) > 0 ){
                continue;
            }

            let deltaY = p1.y - p0.y;
            let deltaX = p1.x - p0.x;
            if(deltaX == 0){
                if(point.x == p1.x)
                    flag = !flag;
                    continue;
            }
            let k = deltaY / deltaX;
            let d = p0.y - k * p0.x;

            let pY = k * point.x + d;
            if(pY > point.y)
                flag = !flag;

        }
        return flag;
    }

    static GetConvex( edge : Array<Vector> ) : Array<Vector> {
        // 1、find the border point
        let bottom = edge[0]
        for( let i = 0 ; i < edge.length ; ++i ){
            let v = edge[i];
            if( v.y < bottom.y ) bottom = v;
        }
        
        interface PointCache {
            cos : number , 
            vec : Vector 
        };

        let e1 = new Vector(1,0);
        let angles:Array<PointCache> = []

        let insert = (obj : PointCache) => {
            if(angles.length <= 0){
                angles.push(obj);
                return ;
            }
            let i = 0;
            while(i < angles.length){
                if(obj.cos > angles[i].cos)
                    break;
                ++i;
            }
            angles.splice(i,0,obj);
        }
        
        for(let i = 0 ; i < edge.length ; ++i ){

            if( edge[i].equal( bottom ) )
                continue;
            let feature = edge[i].sub( bottom );
            
            let v = feature.normalize();
            
            let cos = e1.dot(v);
            
            if(!isNaN(cos)){
                insert({cos , vec:edge[i]})
            }
        }
    
        //apply the algorithm for get the convex of the set of of the points

        let stack = new Stack();
        stack.push( bottom );
        stack.push( angles[0].vec ); 
        angles.shift();


        // check if the point should be pushed into the stack 
        let push = (stack : Stack<any> , vec : Vector ) => {
            if(stack.length < 2){
                stack.push(vec);
                return ;
            }
            let p0 = stack.top();
            stack.pop();
            let p1 = stack.top();
            stack.pop();
            let v = p0.sub(p1);
            let v1 = vec.sub(p0)
            let z = Vector.Direction(v,v1);
            if(z > 0){
                stack.push(p1)
                stack.push(p0)
                stack.push(vec);
            }else{
                stack.push(p1)
                push(stack,vec);
            }
        }

        //check all of the points
        for(let i=0;i<angles.length;++i){
            push(stack,angles[i].vec);
        }
        return stack.data;
    }

    static Minkowski( conv1 : Array<Vector>  , conv2 : Array<Vector> , mode = 'diff' ) : Array<Vector>{
        
        let shape : Array<Vector> = [];
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
        shape = Tool.GetConvex(shape);
        return shape;
    }

    static _lut = ["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"]


    static LinearInterpolate( p0 : Vector , p1 : Vector , w = 0) : Vector {
        let dx = p1.x - p0.x;
        let dy = p1.y - p0.y;

        return new Vector(p0.x + dx * w , p0.y + dy * w);
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

    private origin : Vector;
    private direction : Vector;

    constructor( origin : Vector  , direction : Vector ){
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
    append( point : Vector ) : Box {
        let top = this.top > point.x ? this.top : point.x;
        let right = this.right > point.y ? this.right : point.y;
        let bottom = this.bottom < point.y ? this.bottom : point.y;
        let left = this.left < point.x ? this.left : point.x;

        return new Box(top , right , bottom , left);
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

export {Tool , Ray , Box}