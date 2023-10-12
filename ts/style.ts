
enum JoinType { ROUND , BEVEL , MITER};

interface StyleConfig {
    lineWidth : number | null | undefined ;
    color : Color;
    background : Color | null | undefined ;
    opacity : number;
    lineJoin : any;
    lineCap : any;
    closePath : boolean;
}

class Color{

    static Black : Color = new Color();
    static White : Color = new Color(255,255,255);
    static Red : Color = new Color(255,0,0);
    static Green : Color = new Color(0,255,0);
    static Blue : Color = new Color(0,0,255);
    static Gray : Color = new Color(128,128,128);

    public r : number;
    public g : number;
    public b : number;
    
    constructor( r = 0 , g = 0 , b = 0 ){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    add( color : Color ) : Color {
        return new Color( this.r + color.r , this.g + color.g , this.b + color.b );
    }

    sub(color : Color ) : Color {
        return new Color( this.r - color.r , this.g - color.g , this.b - color.b );
    }

    mul( color : Color ) : Color {
        return new Color( this.r * color.r , this.g * color.g , this.b * color.b );
    }

    reverse( color : Color ) : Color {
        return (new Color(255,255,255)).sub( this );
    }

    toString() : string {
        return `rgb(${this.r},${this.g},${this.b})`;
    }

    parse( color : string ) : Color {
        return new Color();
    }; 

}

class Font {
    public name : string ;
    public fontSize : number ;
    public textAlign : string;
    public textBaseLine : string ;

    constructor( name : string , fontSize : number , textAlign : string , textBaseLine : string ){
        this.name = name;
        this.fontSize = fontSize;
        this.textAlign = textAlign;
        this.textBaseLine = textBaseLine;
    }
    static fromString( config : string ) : Font {
        return new Font('',0,'','');
    }
}


const DefaultStyleConfig : StyleConfig = {
    lineWidth : 1,
    color : Color.Green , 
    background : Color.Black,
    opacity : 1.0,
    lineJoin : JoinType.ROUND , 
    lineCap : JoinType.ROUND , 
    closePath : false 
};




class Style{

    public lineWidth : number;
    public color : Color;
    public background : Color;
    public opacity : number;  
    public lineJoin : JoinType;
    public lineCap : JoinType;
    public closePath : boolean;

    constructor( config? : StyleConfig | undefined  ){

        config = {...DefaultStyleConfig , ...config };
        this.lineWidth      = config.lineWidth;
        this.color          = config.color;
        this.background     = config.background;
        this.opacity        = config.opacity;

        this.lineJoin       = config.lineJoin;
        this.lineCap        = config.lineCap;
        // polygon is closed-path , path is not closed-path
        this.closePath    = config.closePath;
    }

    // TODO : finish the correction
    static setStyle( pen : CanvasRenderingContext2D  , style : Style ) : void {
        if( style.background ) pen.fillStyle = style.background.toString();
        if( style.color ) pen.strokeStyle = style.color.toString();
        pen.lineWidth = style.lineWidth;
        pen.lineJoin = 'round';
        pen.lineCap = 'round';
        pen.globalAlpha = style.opacity;
    }

    static setStroke( pen : CanvasRenderingContext2D , style : Style ) : void {
        pen.stroke();
    }

    static setFill( pen : CanvasRenderingContext2D , style : Style ) : void {
        pen.fill();
    }

    static setRender( pen : CanvasRenderingContext2D  , style : Style ) : void {
        if(style.background != null)
            Style.setFill(pen , style);
        
        if(style.lineWidth > 0)
            Style.setStroke(pen, style);
    }
}


export {Color , Style}