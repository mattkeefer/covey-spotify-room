import { Box, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { Track } from '../../types/CoveyTownSocket';
import useTownController from '../../hooks/useTownController';

/**
 * Lists the current Spotify endpoint information for the player
 */
export default function SpotifyDataList(): JSX.Element {
  const townController = useTownController();
  const [topTracks, setTopTracks] = useState<Track[]>();

  useEffect(() => {
    async function getTopTracks() {
      const tracks = await townController.getSpotifyTopSongs();
      setTopTracks(tracks);
    }
    getTopTracks();
  }, [townController]);

  return (
    <Box>
      <Heading as='h2' fontSize='l'>
        Spotify top songs
      </Heading>
      <OrderedList>
        {topTracks &&
          topTracks.map(track => (
            <ListItem key={track.id}>
              {track.name} by {track.artists[0]}
            </ListItem>
          ))}
      </OrderedList>
    </Box>
  );
}
