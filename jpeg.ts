
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


export { JPEG }