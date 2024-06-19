import { Stack } from "./collection.js";
import { Vector3 } from "./vector.js";

class GMath {
    
    static getSlop( v0 : Vector3 , v1 : Vector3 ) : number {
        if( v0.x == v1.x ) return Number.POSITIVE_INFINITY;
        return ( v1.y - v0.y ) / ( v1.x - v0.x );
    }

    static isLineIntersected( p0 : Vector3 , p1 :Vector3 , p2 : Vector3 , p3 : Vector3  ) : boolean {

        // l0 => p0 : upper , p1 : lower
        // l1 => p2 : upper , p3 : lower
        
        let v0 = p2.sub(p1); // ( l1->upper - l0->lower , 1.0f );
        let v1 = p0.sub(p2)//( l0->upper - l1->upper , 1.0f );
        let v2 = p3.sub(p0)//( l1->lower - l0->upper , 1.0f );
        let v3 = p1.sub(p3)//( l0->lower - l1->lower , 1.0f );
    
        let c0z : number = Vector3.Direction(v0,v1);
        let c1z : number = Vector3.Direction(v1,v2);
        let c2z : number = Vector3.Direction(v2,v3);
        let c3z : number = Vector3.Direction(v3,v0);
    
        if( c0z > 0 && c1z > 0 && c2z > 0 && c3z > 0 || c0z < 0 && c1z < 0 && c2z < 0 && c3z < 0 ){
            return true;
        }
        return false;
    }

    static IsPointInCircle( center : Vector3 , radius : number  , point : Vector3 ) : boolean {

        let dis = Vector3.SquaDist(center , point);
        if(dis > radius * radius)
            return false;
        return true;

    }

    static IsPoingInEllipse( a : number , b : number , point : Vector3 ) : boolean {
        return false;
    }

    static isPointInLine( p0 : Vector3 , p1 : Vector3 , point : Vector3 , eps = 1.0 ) : boolean {

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

    static isPointInPath( edge : Array< Vector3 > , point : Vector3 , eps = 1.0) : boolean {
        for( let i = 1 ; i < edge.length ; ++i ){
            if( this.isPointInLine( edge[ i - 1 ] , edge[i] , point , eps ) ) return true;
        }
        return false;
    }

    static IsPointInRect( edge : Array<Vector3> , point : Vector3 ) : boolean {

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

    static IsPointInPolygon( edge : Array<Vector3> , point : Vector3  ) : boolean {

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

    static GetConvex( edge : Array<Vector3> ) : Array<Vector3> {
        // 1、find the border point
        let bottom = edge[0]
        for( let i = 0 ; i < edge.length ; ++i ){
            let v = edge[i];
            if( v.y < bottom.y ) bottom = v;
        }
        
        interface PointCache {
            cos : number , 
            vec : Vector3 
        };

        let e1 = new Vector3(1,0);
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
        let push = (stack : Stack<any> , vec : Vector3 ) => {
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
            let z = Vector3.Direction(v,v1);
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

    static GetDistanceFromPointToLine( point : Vector3 , start : Vector3 , end : Vector3 ) : number {
        return ( ( start.x  - point.x ) * ( end.y - start.y ) - ( start.y - point.y ) * ( end.x - start.x ) ) / Math.sqrt( Math.pow( end.x - start.x , 2 ) * Math.pow( end.y , start.y ) ); 
    }


    static GJK( p0 : Array< Vector3 > , p1 : Array< Vector3 >  ) : boolean {

        let supportVector = Vector3.X;

        // get the support point given the polygon and the direction
        let _getFarthest = ( poly : Array< Vector3 > , direction : Vector3 ) : number => {

            let center : Vector3 = new Vector3(0,0,0);
            for( let i = 0 ; i < poly.length ; ++ i ){
                center = center.add( poly.at( i ) );
            }
            center = center.scale( 1 / poly.length );

            let p : Vector3 = poly.at( 0 ).sub( center );
            let s = p.dot( direction );
            let index = 0 ;
            for( let i = 1 ; i < poly.length ; ++ i ){
                p = poly.at( i ).sub( center );
                let st = p.dot( direction );
                if( st > s ){
                    s = st;
                    index = i;
                }
            }
            return index;
        }

        // process the line case , we need to compute the support vector 
        let _getDirection = ( A : Vector3 , B : Vector3 ) : Vector3 => {
            let AB = B.sub( A );
            let AO = Vector3.O.sub( A );
            let direction = AB.cross( AO ).cross( AB );
            return direction;
        }

        // process the simplex 
        let _processSimplex = ( simplex : Array< Vector3 > ) : boolean => {

            // the simplex consists of two point 
            // in this case , the simplex can't ensure the relation between the simplex with the origin 
            // so it just to generate the new support vector and go to the next step
            if( simplex.length == 2 ){
                supportVector = _getDirection( simplex.at( 0 ) , simplex.at( 1 ) );
            }else if( simplex.length == 3 ){ 
                // the simplex consists of three point 
                // in this case , we need to check which edge is the nearest one to the origin
                let A : Vector3 = simplex.at( 0 ) , B : Vector3 = simplex.at( 1 ) , C : Vector3 = simplex.at( 2 );

                let AB : Vector3 = B.sub( A ) , AC : Vector3 = C.sub( A ) , AO : Vector3 = Vector3.O.sub( A );
                let nOfAB = AC.cross( AB ).cross( AB );
                let nOfAC = AB.cross( AC ).cross( AC );

                if( nOfAB.dot( AO ) > 0  ){ // the region AB may contain the origin
                    // remore the point c
                    simplex.splice( 2 , 1 );
                    return false;
                }else if( nOfAC.dot( AO ) >0 ) { // the region AC may containe the origin 
                    // remove the point B
                    simplex.splice( 1 , 1 );
                    return false;
                }
                return true;
            }

            return false;
        }


        
        let MDiffs : Array< Vector3 > = [];

        let p0FarthestPointIndex = _getFarthest( p0 , supportVector );
        let p1FarthestPointIndex = _getFarthest( p1 , supportVector.reverse() );

        let MDiff = p1[ p1FarthestPointIndex ].sub( p0[ p0FarthestPointIndex ] );
        MDiffs.push( MDiff );
        supportVector = MDiff;

        while( true ){

            p0FarthestPointIndex = _getFarthest( p0 , supportVector );
            p1FarthestPointIndex = _getFarthest( p1 , supportVector.reverse() );

            MDiff = p1[ p1FarthestPointIndex ].sub( p0[ p0FarthestPointIndex ] );

            if( supportVector.dot( MDiff ) < 0  ) return false;

            MDiffs.push( MDiff );

            if( _processSimplex(MDiffs) )
                return true;

        }
    }


    
}


export { GMath }