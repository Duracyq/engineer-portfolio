import './App.scss';
import './Navigation'
import Navigation from './Navigation';

function App() {
  const lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat, ligula ac tincidunt ullamcorper, ligula est lobortis tellus, nec fermentum orci ipsum ut ante. Sed lacinia tellus id metus venenatis, vel vulputate ipsum scelerisque. Aliquam pretium justo vel justo venenatis, in cursus justo faucibus. Fusce vel ipsum quis dolor feugiat vestibulum. Nulla facilisi. Duis vel aliquet metus, non eleifend odio. Nullam congue, velit a hendrerit lacinia, lectus urna facilisis mi, id fermentum mi elit et turpis. Vivamus laoreet, odio a pulvinar hendrerit, nulla ex mollis dolor, id eleifend nibh dolor vel dui. Vestibulum bibendum eget sapien id vehicula. Sed quis libero vitae neque hendrerit mattis. Maecenas vel malesuada libero. Suspendisse potenti."
  return (
    <div className="App">
      <div className='App-layout'>
        <Navigation />
        <p>{lorem}</p>
      </div>
    </div>
  );
}

export default App;
