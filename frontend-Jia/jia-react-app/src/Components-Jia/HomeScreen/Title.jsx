// New component for header

function Title(){
    //within the return statement, you can write pure HTML
    return(
        <header>
            <h1 className="home-page-text" style={{display:'flex', justifyContent:'center', alignItems:'center'}}>Career Pathway</h1>
            <hr style={{width:'auto', textAlign:'left', margin:30}}></hr>
        </header>
    );

}

export default Title