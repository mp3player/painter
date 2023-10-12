
import { ArrayList } from "./collection";

class Timer {

    private static time : Date = new Date();

    public static  ticks : ArrayList<Date>;

    static getCurrentTime( ) : Date {
        
        return new Date();

    }

    static updateCurrentTime() : Date {
        
        Timer.time = new Date();
        return Timer.time;

    }

    static getDelteTime() : number {
        
        let currentTime : Date = Timer.getCurrentTime()
        let deltaTime : number = currentTime.getTime() - Timer.time.getTime();

        Timer.time = currentTime;

        return deltaTime;

    }

    static addTick() : void {

        Timer.ticks.add( Timer.time );

    }

};

export { Timer }