import "./App.scss";

function Navigation(){
    const menuPositions = [
        { id: 1, name: 'Lorem' },
        { id: 2, name: 'Ipsum' },
        { id: 3, name: 'Dolor' },
        { id: 4, name: 'Sit' },
        { id: 5, name: 'Amet' },
        { id: 6, name: 'Consectetur' }
      ];
      

    return(
        <div className="Navigation">
            <ul className="el">
                {menuPositions.map(i => (
                    <li key={i.id}>{i.name}</li>
                ))}
            </ul>
        </div>
    )
}

export default Navigation;