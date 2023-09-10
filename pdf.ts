

class PDF {

    static readPDF( fileName : string ) : void {
        fetch( fileName )
            .then(d => d.arrayBuffer())
            .then(d => {
                console.log(d)
            })
    }
};


export { PDF }