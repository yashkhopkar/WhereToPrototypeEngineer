import { useEffect, useState, useRef } from 'react';
import './App.css';

const apiBaseUrl = 'http://demo.subsonic.org/rest/';
const credentials = `u=guest&p=guest&v=1.12.0&c=myApp&f=json`;

function App() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [albumDetails, setAlbumDetails] = useState(null);
  const [albumCoversWidth, setAlbumCoversWidth] = useState(0);
  const albumCoversRef = useRef(null);

  useEffect(() => {
    const fetchAlbums = async () => {
      const response = await fetch(
        `${apiBaseUrl}getAlbumList2?${credentials}&type=newest&size=10`
      );
      const data = await response.json();
      const albumList = data['subsonic-response'].albumList2.album;
      setAlbums(albumList);
      setSelectedAlbumIndex(0);
      fetchAlbumDetails(albumList[0].id);
    };

    fetchAlbums();
  }, []);

  useEffect(() => {
    setAlbumCoversWidth(albumCoversRef.current.offsetWidth);
  }, [setAlbumCoversWidth]);

  const fetchAlbumDetails = async (albumId) => {
    const response = await fetch(
      `${apiBaseUrl}getAlbum?${credentials}&id=${albumId}`
    );
    const data = await response.json();
    setAlbumDetails(data['subsonic-response'].album);
  };

  const selectAlbum = (direction) => {
    let newIndex =
      (selectedAlbumIndex + direction + albums.length) % albums.length;
    setSelectedAlbumIndex(newIndex);
    fetchAlbumDetails(albums[newIndex].id);
  };

  const getImageUrl = (coverArtId) => {
    return `${apiBaseUrl}getCoverArt?${credentials}&id=${coverArtId}&size=100`;
  };

  const getTransform = () => {
    const imageWidth = 100;
    const offset = (albumCoversWidth - imageWidth) / 2;
    return `translateX(${offset - selectedAlbumIndex * imageWidth}px)`;
  };

  return (
    <div className='App'>
      <div className='gallery'>
        <button onClick={() => selectAlbum(-1)}>{'\u21D0'}</button>
        <div
          className='album-covers'
          ref={albumCoversRef}
        >
          {albums.map((album, index) => (
            <img
              key={album.id}
              src={getImageUrl(album.coverArt)}
              alt={album.name}
              className={index === selectedAlbumIndex ? 'selected' : ''}
              style={{
                transform: getTransform(),
                transition: 'transform 0.5s ease-in-out',
              }}
            />
          ))}
        </div>
        <button onClick={() => selectAlbum(1)}>{'\u21D2'}</button>
      </div>
      {albumDetails && (
        <div className='album-details'>
          <h1>{albumDetails.name}</h1>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Track</th>
              </tr>
            </thead>
            <tbody>
              {albumDetails.song.map((track, index) => (
                <tr key={track.id}>
                  <td>{index + 1}</td>
                  <td>{track.title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
