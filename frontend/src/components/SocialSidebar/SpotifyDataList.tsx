import { Box, Button, Heading, ListItem, OrderedList } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { SongArea, Track } from '../../types/CoveyTownSocket';
import useTownController from '../../hooks/useTownController';
import SongAreaController from '../../classes/SongAreaController'
import SongArea1 from '../Town/interactables/SongArea';
import { useSongAreaController } from '../../classes/TownController';

/**
 * Lists the current Spotify endpoint information for the player
 */
export default function SpotifyDataList(controller: SongAreaController): JSX.Element {
  const townController = useTownController();
  const [topTracks, setTopTracks] = useState<Track[]>();

  useEffect(() => {
    async function getTopTracks() {
      const tracks = await townController.getSpotifyTopSongs();
      setTopTracks(tracks);
    }
    getTopTracks();
  }, [townController]);

  const incSongLikes = () => {
    // increment the number of likes for the current song
    townController
      .incrementSongAreaLikes(controller)
      .then(newLikes => (controller.like_count = newLikes));
  };
  return (
    <>
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
      <Box>
        {/* // like button */}
        <Button onClick={incSongLikes}>Like</Button>
        {/* // dislike button */}
        <Button>Dislike</Button>
      </Box>
    </>
  );
}
