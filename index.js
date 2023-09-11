import { Matrix, Vector , Complex } from "./dist/vector.js";
import { ArrayList, LinkedList , Tree } from "./dist/collection.js";
import { Painter } from "./dist/painter.js";
import { Circle, Convex, Path , Polygon, Rectangle , QuadraticBezierCurve, Arc, Shape , Text } from "./dist/shape.js";
import { Tool } from "./dist/util.js";
import { MouseActiveEvent } from "./dist/event.js";
import { Color } from "./dist/style.js";
import { JPEG } from './dist/jpeg.js'


let painter = new Painter(canvas);
// painter.setTranslation( 500,500);
console.log( painter )
painter.updateTransformShape();

let center = new Circle(100,0,0);
center.style.background = Color.Red;
// center.style.opacity = .2;

let rect = new Rectangle(20,20,200,300);
rect.style.background = 'rgba(0,0,0,.4)'


painter.add( center );
painter.add( rect );

center.index = 10;


painter.on('mousedown',e => {
    e.target.style.color = 'blue';
    e.target.style.lineWidth = 4;
})

painter.on('mouseup' , e => {
    e.target.style.color = 'rgba(0,0,0,.2)'
    e.target.style.lineWidth = 1;
})

center.translate( new Vector( 100 , 100  ) );

let polygon = new Polygon([] , 0 , 0);
polygon.append( new Vector(  0 , 0 ) )
polygon.append( new Vector(  100 , 100 ) )
polygon.append( new Vector(  100,-300) )

rect.add( polygon )

let path = new Path();
path.append( new Vector( 200 , 200 ) )
path.append( new Vector( 300 , 300 ) )
path.append( new Vector( 200 , 300 ) )
path.style.background = null;

painter.add( path );

let tree = new Tree(( a , b ) => {
    if( a == b ) return 0;
    if( a > b ) return 1;
    return -1;
});

for( let i = 0 ; i < 10 ; ++ i ){
    let key = Number.parseInt( Math.random() * 100 ) ;
    let value = Math.random() * 10;
    console.log( key , value )
    if( tree.has( key ) ){
        let arr = tree.get( key );
        arr.push( value );
    }else{
        tree.add( key , [ value ] );
    }
}

for( let str of tree.keys() ){
    console.log( str ,  tree.get( str ) ) ;
}

let a = () => {
    
    painter.flush();
    painter.render();
    // painter.rotate( .01 )

    requestAnimationFrame(a);

}

a() 
