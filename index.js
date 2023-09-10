import { Matrix, Vector , Complex } from "./dist/vector.js";
import { ArrayList, LinkedList } from "./dist/collection.js";
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

let rect = new Rectangle(200,200,0,0);
rect.style.background = 'rgba(0,0,0,.4)'


painter.add( center );
painter.add( rect );

center.index = 10;

let r = new Rectangle( 200, 200,100,100);
r.style.background = 'rgba(0,0,0,.4)';


painter.on('mousedown',e => {
    e.target.style.background = 'blue';
})

painter.on('mouseup' , e => {
    e.target.style.background = 'rgba(0,0,0,.2)'
})

center.translate( new Vector( 100 , 100  ) );

let a = () => {
    
    painter.flush();
    painter.render();
    painter.rotate( .01 )

    requestAnimationFrame(a);

}

a() 
