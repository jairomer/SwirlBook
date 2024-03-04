import { useState, Component } from 'react';
import './App.css';
import MiniRepl from './strudel/MiniRepl';
import { FixedSizeList as List } from "react-window";

const SONG_LIST_INDEX = "https://raw.githubusercontent.com/jairomer/strudel/master/index.json";

class SongList extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = { 
      songList: []
    }
  }

  _fetchSongList() {
    const songListPromise = fetch(SONG_LIST_INDEX);
    songListPromise
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          songList: data,
        })
      })
      .catch((error) => {
      console.log(error);
    });
  }

  _renderLoading() {
    console.log("Loading...");
    return (
      <>
        <p className="List">Loading...</p>
      </>
    );
  }

  _renderList(onSongSelectionCb) {
    console.log("Redering list...");
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
              onClick={()=>{onSongSelectionCb(song.path)}}
            >
              {song.name}
            </li>
          ))}
        </ul>
      </>
    );
  }

  render() {
    //console.log(this.props.onSongSelectionCb);
    const onSongSelectionCb = this.props.onSongSelectionCb === undefined ? 
      (url)=>{ console.log(url); } :
      (url)=>{ this.props.onSongSelectionCb(url); }

    if (this.state.songList.length === 0 ) {
      this._fetchSongList();
    }
    const renderedList = this.state.songList.length === 0 ? 
      this._renderLoading() : this._renderList(onSongSelectionCb);
    return (
      <>
        { renderedList }
      </>
    );
  }

}

class StrudelApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tune : "// Select a tune from the list below.",
    }
  }

  _onSongSelectionCb = songUrl => {
    console.log(songUrl);
    const songPromise = fetch(songUrl);
    songPromise
      .then((response) => response.text())
      .then((data) => {
        console.log(data);
        this.setState({ tune: data });
      })
      .catch((error) => {
      console.log(error);
    });
  }

  render() {
    /*TODO:
      - Substitute currently playing tune by the one selected on the list.
      - Add search bar for the index and dinamically update recomendations.
    */
    return (
      <>
        <div className="m-10 bg-neutral-800 justify-center items-center ">
          <MiniRepl className="minirepl" tune={this.state.tune} />
        </div>
        <div className="m-10 bg-neutral-800 justify-center items-center ">
          <SongList onSongSelectionCb={ this._onSongSelectionCb }/>
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
