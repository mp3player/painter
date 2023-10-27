import { Tool } from "./util.js";
import { Vector } from "./vector.js";


class Geometry {

    static FindEar( edge : Array< Vector > , anti : boolean  ) : Array< number >{
        
        if( edge.length == 3 ) return [ 0 , 1 , 2 ];

        for( let i = 0 ; i < edge.length ; ++ i ){

            let prevIndex : number = ( i - 1 + edge.length ) % edge.length;
            let currentIndex : number = i ;
            let nextIndex : number = ( i + 1 ) % edge.length;

            let v0 = edge.at( currentIndex ).sub( edge.at( prevIndex ) );
            let v1 = edge.at( nextIndex ).sub( edge.at( currentIndex ) );

            if( anti == true && Vector.Direction( v0 , v1 ) < 0 ) continue;
            else if( anti == false && Vector.Direction( v0 , v1) > 0 ) continue; 

            let triangle : Array< Vector > = [ edge.at( prevIndex ) , edge.at( currentIndex ) , edge.at( nextIndex ) ];
            
            let isEar : boolean = true;
            for( let j = 0 ; j < edge.length ; ++ j ){

                if( j == prevIndex || j == currentIndex || j == nextIndex ) {
                    continue;
                } 
                
                if( Tool.IsPointInPolygon( triangle , edge.at( j ) ) ){
                    // this is not a ear
                    isEar = false;
                    break;
                }

            }

            if( isEar == true ){
                return [ prevIndex , currentIndex , nextIndex ];
            }

        }

    }

    // two-ear implementation
    static Triangulate( path : Array< Vector > , anti = true ) : Array< Array< Vector > >{

        // clone 
        let edge : Array< Vector > = [];

        for( let i = 0 ; i < path.length ; ++ i ){
            edge.push( path.at( i ).clone() );
        }
        
        let triangles : Array< Array< Vector > > = [];
        let i = 0;
        while( edge.length >= 3 ){
            // console.log( edge )
            let ear = Geometry.findEar( edge , anti );
            triangles.push( [ edge.at( ear[0] ) , edge.at( ear[1] ) , edge.at( ear[2] ) ] );
            // delete 
            edge.splice( ear[1] , 1 );
            
        }

        return triangles;
        
    }

    static GJKDetection( poly0 : Array< Vector > , poly1 : Array< Vector > ){
        // 1.random direction
        // 2.compute furthest point => ensure direction
        // 3.compute normal
        let direction : Vector = Vector.X;
        let simplex : Array< Vector > = [];
        let initialSupportVector : Vector = Geometry.GetSupportVector( direction , poly0 , poly1 );

        simplex.push( initialSupportVector );
        direction = Vector.O.sub( initialSupportVector );
        
        while( true ){

            let supportVector : Vector = Geometry.GetSupportVector( direction , poly0 , poly1 );
            simplex.push( supportVector );

            // whether the line is passing the origin 
            // if no => return no intersection
            // if yes => go on
            if( direction.dot( supportVector ) < 0 ) return false;

            if( simplex.length == 2 ){
                
                let normal = Geometry.GetNormalTowardOrigin( simplex[0] , simplex[1]  );
                supportVector = Geometry.GetSupportVector( normal , poly0 , poly1 );
                
                // whether the line is passing the origin 
                // if no => return no intersection
                // if ues => add to the simplex
                
                if( direction.dot( supportVector ) < 0 ) return false;

                simplex.push( supportVector );

            }else{
                
                // whether the triangle is passting the origin  
                if( Tool.IsPointInPolygon( simplex , new Vector ) ){
                    return true;
                }

                // if not , retain the edge nearest to the origin

            }

            break;
        }
        // 

    }

    static GetFurthestPoint( direction : Vector , poly : Array< Vector > ) : Vector {
        
        if( poly.length <= 0 ) return null;

        let value : number = direction.dot( poly.at(0) );
        let point = poly.at(0);

        for( let i = 1 ; i < poly.length ; ++ i ){
            let v = direction.dot( poly.at( i ) );
            if( v > value ){
                value = value;
                point = poly.at( i );
            }
        }

        return point;

    }

    static GetSupportVector( direction : Vector , poly0 : Array< Vector > , poly1 : Array< Vector > ) : Vector {
        let fp0 : Vector = Geometry.GetFurthestPoint( direction , poly0 );
        let fp1 : Vector = Geometry.GetFurthestPoint( direction.reverse() , poly1 );
        return fp1.sub( fp0 );
    }

    static IsPassOrigin( direction : Vector , supportVector : Vector ) : boolean {
        return direction.dot( supportVector ) > 0;
    }

    static GetCentroid( poly : Array< Vector > ) {
        
        let centroid = new Vector();
        for( let i = 0 ; i < poly.length ; ++ i ){
            centroid.add( poly.at( i ) );
        }
        centroid.scale( 1.0 / poly.length );
        return centroid ;

    }

    static GetNormalTowardOrigin( start : Vector , end : Vector ) : Vector {
        let line : Vector = end.sub( start );
        let perpendicular = line.perpendicular();
        let o = Vector.O.sub( start );
        if( perpendicular.dot( o ) < 0  ) perpendicular = perpendicular.reverse();
        
        return perpendicular;
    }

    static GetNearestEdgeToOrigin( A : Vector , B : Vector , C : Vector ){


    }

    static GetDistanceFromPointToLine( point : Vector , start : Vector , end : Vector ) : number {

        return ( ( start.x  - point.x ) * ( end.y - start.y ) - ( start.y - point.y ) * ( end.x - start.x ) ) / Math.sqrt( Math.pow( end.x - start.x , 2 ) * Math.pow( end.y , start.y ) ); 
    }

}


export { Geometry }