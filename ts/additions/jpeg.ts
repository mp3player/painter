

const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

// marker1 <type1> [length2]
const MARKER = 0xff;
const SOI = 0xD8;       // start of image
const SOF0 = 0xC0       // start of frame (baseline DCT)
const SOF2 = 0xC2       // start of frame (progressive DCT)
const DHT = 0xC4        // define Huffman table
const DQT = 0xDB        // define quantization table
const DRI = 0xDD        // define restart inverse
const SOS = 0xDA        // start of scan
const RST0 = 0xD0       // restart
const RST1 = 0xD1       // restart
const RST2 = 0xD2       // restart
const RST3 = 0xD3       // restart
const RST4 = 0xD4       // restart
const RST5 = 0xD5       // restart
const RST6 = 0xD6       // restart
const RST7 = 0xD7       // restart
const APP0 = 0xE0       // application-spedific
const APP1 = 0xE1       // application-spedific
const APP2 = 0xE2       // application-spedific
const APP3 = 0xE3       // application-spedific
const APP4 = 0xE4       // application-spedific
const APP5 = 0xE5       // application-spedific
const APP6 = 0xE6       // application-spedific
const APP7 = 0xE7       // application-spedific
const COM = 0xFE        // comment
const EOI = 0xD9        // end of image


class Block {
    
    public N : number;
    public buffer : Float32Array;

    constructor( N : number ){
        this.N = N;
        this.buffer = new Float32Array ( N * N );
    }

    get( x : number , y : number ) : number {
        return this.buffer[ y * this.N + x ];
    }

    set( x : number , y : number , value : number ) : void {
        this.buffer[ y * this.N + x ] = value;
    }

};

let dct : ( buffer : Block ) => Block;
let idct : ( buffer : Block ) => Block;

let dct1 : ( buffer : Block ) => Block;
let dct2 : ( buffer : Block ) => Block;
let dct3 : ( buffer : Block ) => Block;
let dct4 : ( buffer : Block ) => Block;

let idct1 : ( buffer : Block ) => Block;
let idct2 : ( buffer : Block ) => Block;
let idct3 : ( buffer : Block ) => Block;
let idct4 : ( buffer : Block ) => Block;


class JPEG {

    static readJPEG( fileName : string ) : void {
        fetch( fileName )
            .then(d => d.arrayBuffer())
            .then( ( d : ArrayBuffer )  => {
                let byte = new Uint8Array(d);
                for( let i = 0 ; i < byte.length ; ++ i ){
                    if(byte[i] == MARKER){
                        console.log(i)
                    }
                }
            })
    }
};


dct = function( buffer : Block ) : Block {

    let N = buffer.N;

    let freq = new Block( N );

    for( let i = 0 ; i < N ; ++ i ){
        for( let j = 0 ; j < N ; ++ j ){
            
            let value = 0;

            for( let x = 0 ; x < N ; ++ x ){
                for( let y = 0 ; y < N ; ++ y ){

                    value += buffer.get( x , y ) 
                        * cos( PI / N * ( x + .5 ) * i )
                        * cos( PI / N * ( y + .5 ) * j );
                    
                }
            }

            freq.set( i , j , value );

        }
    }


    return freq;
}


idct = function( buffer : Block ) : Block {

    let N = buffer.N;

    let time = new Block( N );

    return buffer;

}


export { JPEG }