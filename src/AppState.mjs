const SONG_LIST_INDEX = "https://raw.githubusercontent.com/jairomer/strudel/master/index.json";

export default class AppState {
  songIndex = [];
  constructor () {
    this.songIndex = []
  }
  async updateSongList() {
    const songListResponse = await fetch(SONG_LIST_INDEX);
    if (!songListResponse.ok) {
      throw new Error("Cannot retrieve songlist");
    }
    const data = await songListResponse.json();
    console.log(data);
    this.songIndex = data.songs;
    console.log(`Song list retrieved`);
    return this.songIndex;
    //songListPromise
    //  .then((response) => response.json())
    //  .then((data) => {
    //    this.songIndex = data;
    //    console.log(data);
    //  })
    //  .catch((error) => {
    //  console.log(error);
    //});
  }
};
