import { Matrix, Vector , Complex } from "./dist/vector.js";
import { ArrayList, LinkedList , Tree , AVLTree } from "./dist/collection.js";
import { Painter } from "./dist/painter.js";
import { Circle , Ellipse, Convex, Path , Polygon, Rectangle , QuadraticBezierCurve, Arc, Shape , Text } from "./dist/shape.js";
import { Tool } from "./dist/util.js";
import { MouseActiveEvent } from "./dist/event.js";
import { Color } from "./dist/style.js";
import { JPEG } from './dist/jpeg.js'
import { BoxHelper } from './dist/helper.js'


let painter = new Painter(canvas);
painter.background = new Color( 100 , 100 , 100 );
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


// painter.on('mousemove',e => {
//     e.target.style.color = 'blue';
//     e.target.style.lineWidth = 4;
// })

// painter.on('mouseup' , e => {
//     e.target.style.color = 'rgba(0,0,0,.2)'
//     e.target.style.lineWidth = 1;
// })


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


let str = `「如果尖銳的批評完全消失，溫和的批評將會變得刺耳。\n
如果溫和的批評也不被允許，沈默將被認為居心叵測。\n
如果沈默也不再允許，贊揚不夠賣力將是一種罪行。\n
如果只允許一種聲音存在，那麼，唯一存在的那個聲音就是謊言。」`
let text = new Text(str );
text.index = 200;
text.size = 20;
// painter.add( text )

center.setScale( 1 , .5 )

let width = innerWidth / 2 , height = innerHeight / 2;

let ellipse = new Ellipse( 50 ,100 , 100 , 100 );
painter.add( ellipse );

ellipse.translate(new Vector( 0 , 200 ) );

let a = () => {
    
    painter.flush();
    painter.render();
    // ellipse.rotate( .01 )

    painter.pen.save();


    requestAnimationFrame(a);

}

a() 
