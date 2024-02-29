import { useState, Component } from 'react';
import './App.css';
import AppState from './AppState';
import MiniRepl from './strudel/MiniRepl';
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import ReactSearchBox from "react-search-box";

class PostFetchApp extends Component {
  render(props) {
    const Row = ({index, style}) => {
      let cls = index % 2 ? "ListItemOdd" : "ListItemEven";
      cls += " Row";

      return (
        <div className={cls} style={style}>
          {index}
        </div>
      );
    };
    /*TODO:
      - Fill List with contents from the song list.
      - Periodically refill the song list.
      - Substitute currently playing tune by the one selected on the list.
      - Add search bar for the index and dinamically update recomendations.
      sw*/
    return (
      <>
        <MiniRepl className="minirepl" tune={"//LOADING..."} />
        <ReactSearchBox
          placeholder="Placeholder"
          value=""
          callback={(record) => console.log(record)}
        />
        <AutoSizer>
          {({ height, width }) => (
            <List 
              className="List"
              height={height}
              width={width}
              itemCount={35}
              itemSize={35}
              >
              {Row}
            </List>
          )}
        </AutoSizer>
      </>
    )

  }
}


function App() {
  //const appState = new AppState();
  //console.log(songList);
//  appState.updateSongList().then(()=>{
//      console.log(appState.songIndex.length)
//  });
  return (
    <>
      <PostFetchApp/>
    </>
  );
}

export default App
