import { Vector } from "./vector.js";
import { Shape } from './shape.js'

class GJK{

    static gjk( shape0 : Array<Vector> , shape1 : Array<Vector> ) : void {
        
        // 1、generate initial vector
        
        let v = new Vector(1);
        let simplex : Array<Vector> = []
        // 2、compute point vector and point
        
        let p0 = GJK.support( shape0 , v );
        let p1 = GJK.support( shape1 , v.scale(-1) );
        
        let p : Vector = shape1[ p1 ].add( shape0[ p0 ] );
        simplex.push( p );
        
        while(true){

            
            break;
        }
        

    }

    static support(vertexes : Array<Vector>  , v : Vector ) : number {
        // return the index of vertex with max dot(vertex,v);
        let res = vertexes[0];
        let sv = v.dot(res);
        let index = 0;

        for(let i = 1 ; i < vertexes.length ; ++ i){
            let vertex = vertexes[i];
            let dot = v.dot(vertex);

            if(dot > sv){
                sv = dot;
                res = vertex;
                index = i;
            }
        }
        return index;
    }

    static nearestSimplex() : any {
        

    }

}

export {GJK}