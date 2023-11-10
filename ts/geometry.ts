import { Tool } from "./util.js";
import { Vector3 } from "./vector.js";


class Geometry {

    static FindEar( edge : Array< Vector3 > , anti : boolean  ) : Array< number >{
        
        if( edge.length == 3 ) return [ 0 , 1 , 2 ];

        for( let i = 0 ; i < edge.length ; ++ i ){

            let prevIndex : number = ( i - 1 + edge.length ) % edge.length;
            let currentIndex : number = i ;
            let nextIndex : number = ( i + 1 ) % edge.length;

            let v0 = edge.at( currentIndex ).sub( edge.at( prevIndex ) );
            let v1 = edge.at( nextIndex ).sub( edge.at( currentIndex ) );

            if( anti == true && Vector3.Direction( v0 , v1 ) < 0 ) continue;
            else if( anti == false && Vector3.Direction( v0 , v1) > 0 ) continue; 

            let triangle : Array< Vector3 > = [ edge.at( prevIndex ) , edge.at( currentIndex ) , edge.at( nextIndex ) ];
            
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
    static Triangulate( path : Array< Vector3 > , anti = true ) : Array< Array< Vector3 > >{

        // clone 
        let edge : Array< Vector3 > = [];

        for( let i = 0 ; i < path.length ; ++ i ){
            edge.push( path.at( i ).clone() );
        }
        
        let triangles : Array< Array< Vector3 > > = [];
        let i = 0;
        while( edge.length >= 3 ){
            // console.log( edge )
            let ear = Geometry.FindEar( edge , anti );
            triangles.push( [ edge.at( ear[0] ) , edge.at( ear[1] ) , edge.at( ear[2] ) ] );
            // delete 
            edge.splice( ear[1] , 1 );
            
        }

        return triangles;
        
    }

    static GJKDetection( poly0 : Array< Vector3 > , poly1 : Array< Vector3 > ){
        // 1.random direction
        // 2.compute furthest point => ensure direction
        // 3.compute normal
        let direction : Vector3 = Vector3.X;
        let simplex : Array< Vector3 > = [];
        let initialSupportVector3 : Vector3 = Geometry.GetSupportVector3( direction , poly0 , poly1 );

        simplex.push( initialSupportVector3 );
        direction = Vector3.O.sub( initialSupportVector3 );
        
        while( true ){

            let supportVector3 : Vector3 = Geometry.GetSupportVector3( direction , poly0 , poly1 );
            simplex.push( supportVector3 );

            // whether the line is passing the origin 
            // if no => return no intersection
            // if yes => go on
            if( direction.dot( supportVector3 ) < 0 ) return false;

            if( simplex.length == 2 ){
                
                let normal = Geometry.GetNormalTowardOrigin( simplex[0] , simplex[1]  );
                supportVector3 = Geometry.GetSupportVector3( normal , poly0 , poly1 );
                
                // whether the line is passing the origin 
                // if no => return no intersection
                // if ues => add to the simplex
                
                if( direction.dot( supportVector3 ) < 0 ) return false;

                simplex.push( supportVector3 );

            }else{
                
                // whether the triangle is passting the origin  
                if( Tool.IsPointInPolygon( simplex , new Vector3 ) ){
                    return true;
                }

                // if not , retain the edge nearest to the origin

            }

            break;
        }
        // 

    }

    /**
     * This methods to get the points which is furthest to the polygon
     * @param direction : vector 
     * @param poly 
     * @returns 
     */
    static GetFurthestPoint( direction : Vector3 , poly : Array< Vector3 > ) : Vector3 {
        
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

    static GetSupportVector3( direction : Vector3 , poly0 : Array< Vector3 > , poly1 : Array< Vector3 > ) : Vector3 {
        
        let fp0 : Vector3 = Geometry.GetFurthestPoint( direction , poly0 );
        let fp1 : Vector3 = Geometry.GetFurthestPoint( direction.reverse() , poly1 );
        return fp1.sub( fp0 );

    }

    static IsPassOrigin( direction : Vector3 , supportVector3 : Vector3 ) : boolean {
        return direction.dot( supportVector3 ) > 0;
    }

    static GetCentroid( poly : Array< Vector3 > ) {
        
        let centroid = new Vector3();
        for( let i = 0 ; i < poly.length ; ++ i ){
            centroid.add( poly.at( i ) );
        }
        centroid.scale( 1.0 / poly.length );
        return centroid ;

    }

    static GetNormalTowardOrigin( start : Vector3 , end : Vector3 ) : Vector3 {
        let line : Vector3 = end.sub( start );
        let perpendicular = line.perpendicular();
        let o = Vector3.O.sub( start );
        if( perpendicular.dot( o ) < 0  ) perpendicular = perpendicular.reverse();
        
        return perpendicular;
    }

    static GetNearestEdgeToOrigin( A : Vector3 , B : Vector3 , C : Vector3 ){


    }

    static GetDistanceFromPointToLine( point : Vector3 , start : Vector3 , end : Vector3 ) : number {

        return ( ( start.x  - point.x ) * ( end.y - start.y ) - ( start.y - point.y ) * ( end.x - start.x ) ) / Math.sqrt( Math.pow( end.x - start.x , 2 ) * Math.pow( end.y , start.y ) ); 
    }

    static ConvertToBaryCentricCoordinate( A : Vector3 , B : Vector3 , C : Vector3 , P : Vector3 ) : Vector3 {
        
        let AB : Vector3 = B.sub( A );
        let AC : Vector3 = C.sub( A );
        let AP : Vector3 = P.sub( A );

        let k1 = AP.dot( AB ) / AB.squareLength();
        let k2 = AP.dot( AC ) / AC.squareLength();

        return new Vector3( 1 - k1 - k2 , k1 , k2 );

    }

    static BFNearest( A : Array< Vector3 > , B : Vector3 ) : number {
        
        if( A.length <= 0 ) return -1;
        
        let dist : number = A.at( 0 ).sub( B ).squareLength();
        let index : number = 0;

        for( let i = 1 ; i < A.length ; ++ i ){
            let d = A.at( i ).sub( B ).squareLength();
            if( d < dist ){
                dist = d;
                index = i;
            }
        }

        return index;

    }

    static normalize( A : Array< Vector3> ) : Array< Vector3 > {
        
        let centroid = new Vector3();
        for( let i = 0 ; i < A.length ; ++ i ){
            centroid = Vector3.Addition( centroid ,  A.at( i ).scale( 1.0 / A.length ) )
        }

        let results : Array< Vector3 > = new Array< Vector3 >();

        for( let i = 0 ; i < A.length ; ++ i ){
            results.push( A.at( i ).sub( centroid ) );
        }
        return results;

    }

    static ICPRegistration( A : Array< Vector3 > , B : Array< Vector3 > ) : void {

        A = Geometry.normalize( A );
        B = Geometry.normalize( B );
        
        // find the nearest point
        let nearest : Array< number > = new Array< number >();

        for( let i = 0 ; i < A.length ; ++ i ){

            let point : Vector3 = A.at( i );
            let nearestIndex : number = Geometry.BFNearest( B , point );
            nearest.push( nearestIndex );

        }


    }




    
}


export { Geometry }