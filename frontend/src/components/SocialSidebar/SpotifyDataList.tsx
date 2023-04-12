import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Playlist, Track } from '../../types/CoveyTownSocket';
import useTownController from '../../hooks/useTownController';

/**
 * Lists the current Spotify endpoint information for the player
 */
export default function SpotifyDataList(): JSX.Element {
  const townController = useTownController();
  const [topTracks, setTopTracks] = useState<Track[]>();
  const [playlist, setPlaylist] = useState<Playlist>();

  // useEffect(() => {
  //   async function getTopTracks() {
  //     const tracks = await townController.getSpotifyTopSongs();
  //     setTopTracks(tracks);
  //   }
  //   getTopTracks();
  // }, [townController]);

  useEffect(() => {
    async function createPlaylist() {
      const playlistObj = await townController.createNewPlaylistWithTopSongs();
      setPlaylist(playlistObj);
    }
    createPlaylist();
  }, [townController]);

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Spotify top songs
      </Heading>
      {playlist && (
        <iframe
          src={`https://open.spotify.com/embed/playlist/${playlist?.id}?utm_source=generator&theme=0`}
          width='100%'
          height='352'
          frameBorder='0'
          allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
          loading='lazy'></iframe>
      )}
      {/* <OrderedList>
        {topTracks &&
          topTracks.map(track => (
            <ListItem key={track.id}>
              {track.name} by {track.artists[0]}
            </ListItem>
          ))}
      </OrderedList> */}
    </Box>
  );
}
