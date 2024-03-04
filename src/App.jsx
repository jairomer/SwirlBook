import { useState, Component } from 'react';
import './App.css';
import MiniRepl from './strudel/MiniRepl';

const SONG_LIST_INDEX = "https://raw.githubusercontent.com/jairomer/strudel/master/index.json";

class StrudelApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tune : "// Select a tune from the list below.",
      songList: [],
      minireplKey: 0,
    }
  }

  _switchMiniReplKey() {
    this.setState({minireplKey: this.state.minireplKey === 0 ? 1 : 0});
  }

  _fetchSongList() {
    const songListPromise = fetch(SONG_LIST_INDEX);
    songListPromise
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          songList: data,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  _onSongSelectionCb(songUrl) {
    console.log(songUrl);
    const songPromise = fetch(songUrl);
    songPromise
      .then((response) => response.text())
      .then((data) => {
        this.setState({ tune: data });
        this._switchMiniReplKey();
        console.log(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  _renderList() {
    const getItemClass = (key) => {
      return (key % 2 == 0) ? "ListItemEven" : "ListItemOdd";
    }
    return (
      <>
        <ul className="List">
          { this.state.songList.songs.map((song, key) => (
            <li 
              key={key}
              className={"Row " + getItemClass(key)}
              onClick={()=>{this._onSongSelectionCb(song.path)}}
            >
              {song.name}
            </li>
          ))}
        </ul>
      </>
    );
  }

  _renderLoading() { return (<><p className="List">Loading...</p></>); }

  render() {
    /*TODO:
      - Add search bar for the index and dinamically update recomendations.
    */
    console.log("Render");
    if (this.state.songList.length === 0 ) {
      this._fetchSongList();
    }

    const renderedList = this.state.songList.length === 0 ? 
      this._renderLoading() : this._renderList();
    return (
      <>
        <div className="m-10 bg-neutral-800 justify-center items-center ">
          <MiniRepl key={this.state.minireplKey} className="minirepl" tune={this.state.tune} />
        </div>
        <div className="m-10 bg-neutral-800 justify-center items-center ">
          { renderedList } 
        </div>
      </>
    )
  }
}


function App() {
  return (
    <>
      <StrudelApp/>
    </>
  );
}

export default App
