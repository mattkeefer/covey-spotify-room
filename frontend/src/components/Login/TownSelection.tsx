import React, { useCallback, useEffect, useMemo, useState } from 'react';
import assert from 'assert';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Link,
  Stack,
  Table,
  TableCaption,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { Town } from '../../generated/client';
import useLoginController from '../../hooks/useLoginController';
import TownController from '../../classes/TownController';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import { SpotifyWebApi } from 'spotify-web-api-ts';
import { PrivateUser } from 'spotify-web-api-ts/types/types/SpotifyObjects';

const SPOTIFY_CLIENT_ID = '6c3a5f706c5b443ca47c478c8836bd82';
const SPOTIFY_REDIRECT_URI =
  window.location.port !== ''
    ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
    : `${window.location.protocol}//${window.location.hostname}`;
const { SPOTIFY_CLIENT_SECRET } = process.env;

export default function TownSelection(): JSX.Element {
  const [userName, setUserName] = useState<string>('');
  const [newTownName, setNewTownName] = useState<string>('');
  const [newTownIsPublic, setNewTownIsPublic] = useState<boolean>(true);
  const [townIDToJoin, setTownIDToJoin] = useState<string>('');
  const [currentPublicTowns, setCurrentPublicTowns] = useState<Town[]>();
  const [accessToken, setAccessToken] = useState<string>('');
  const [spotifyData, setSpotifyData] = useState<PrivateUser>();
  const loginController = useLoginController();
  const { setTownController, townsService } = loginController;
  const { connect: videoConnect } = useVideoContext();

  const toast = useToast();

  // Creates an instance of the SpotifyWebApi which will be stored
  const spotifyApi = useMemo(
    () =>
      new SpotifyWebApi({
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
        redirectUri: SPOTIFY_REDIRECT_URI,
      }),
    [],
  );

  // Permissions needed for Spotify API requests
  const spotifyAuthURL = spotifyApi.getTemporaryAuthorizationUrl({
    scope: [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-private',
      'user-top-read',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
    ],
  });

  function parseAccessToken(hash: string): string | null {
    return new URLSearchParams(hash.substring(1)).get('access_token');
  }

  // Updates the Spotify accessToken if changes occur
  useEffect(() => {
    if (!accessToken && window.location.hash !== '') {
      const token = parseAccessToken(window.location.hash);
      if (token && token !== accessToken) {
        setAccessToken(token);
      }
    }
  }, [accessToken]);

  // Retrieves data from the Spotify API /me endpoint relating to the user
  const getSpotifyAccount = useCallback(async () => {
    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
      try {
        const data = await spotifyApi.users.getMe();
        setSpotifyData(data);
      } catch (error) {
        return error;
      }
    }
  }, [accessToken, spotifyApi]);

  const updateTownListings = useCallback(() => {
    townsService.listTowns().then(towns => {
      setCurrentPublicTowns(towns.sort((a, b) => b.currentOccupancy - a.currentOccupancy));
    });
  }, [setCurrentPublicTowns, townsService]);
  useEffect(() => {
    updateTownListings();
    getSpotifyAccount();
    const timer = setInterval(updateTownListings, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateTownListings, getSpotifyAccount]);

  const handleJoin = useCallback(
    async (coveyRoomID: string) => {
      try {
        if (!spotifyData || !spotifyApi) {
          toast({
            title: 'Unable to join town',
            description: 'Please connect to Spotify',
            status: 'error',
          });
          return;
        }
        if (!userName || userName.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please select a username',
            status: 'error',
          });
          return;
        }
        if (!coveyRoomID || coveyRoomID.length === 0) {
          toast({
            title: 'Unable to join town',
            description: 'Please enter a town ID',
            status: 'error',
          });
          return;
        }
        const newController = new TownController({
          userName,
          townID: coveyRoomID,
          loginController,
          spotifyApi,
        });
        await newController.connect();
        await newController.createNewPlaylistWithTopSongs();
        const videoToken = newController.providerVideoToken;
        assert(videoToken);
        await videoConnect(videoToken);
        setTownController(newController);
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to connect to Towns Service',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected error, see browser console for details.',
            status: 'error',
          });
        }
      }
    },
    [spotifyData, spotifyApi, userName, loginController, videoConnect, setTownController, toast],
  );

  const handleCreate = async () => {
    if (!spotifyData || !spotifyApi) {
      toast({
        title: 'Unable to create town',
        description: 'Please connect to Spotify before creating a town',
        status: 'error',
      });
      return;
    }
    if (!userName || userName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please select a username before creating a town',
        status: 'error',
      });
      return;
    }
    if (!newTownName || newTownName.length === 0) {
      toast({
        title: 'Unable to create town',
        description: 'Please enter a town name',
        status: 'error',
      });
      return;
    }
    try {
      const newTownInfo = await townsService.createTown({
        friendlyName: newTownName,
        isPubliclyListed: newTownIsPublic,
      });
      let privateMessage = <></>;
      if (!newTownIsPublic) {
        privateMessage = (
          <p>
            This town will NOT be publicly listed. To re-enter it, you will need to use this ID:{' '}
            {newTownInfo.townID}
          </p>
        );
      }
      toast({
        title: `Town ${newTownName} is ready to go!`,
        description: (
          <>
            {privateMessage}Please record these values in case you need to change the town:
            <br />
            Town ID: {newTownInfo.townID}
            <br />
            Town Editing Password: {newTownInfo.townUpdatePassword}
          </>
        ),
        status: 'success',
        isClosable: true,
        duration: null,
      });
      await handleJoin(newTownInfo.townID);
    } catch (err) {
      if (err instanceof Error) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      } else {
        console.trace(err);
        toast({
          title: 'Unexpected error, see browser console for details.',
          status: 'error',
        });
      }
    }
  };

  return (
    <>
      <form>
        <Stack>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Spotify Account
            </Heading>
            {accessToken ? (
              <Flex justifyContent='center' alignItems='center'>
                <Text flex='1' noOfLines={2}>
                  Connected to Spotify account: {spotifyData?.display_name}
                </Text>
                <Image
                  borderRadius='full'
                  width={'25%'}
                  src={spotifyData?.images[0].url}
                  alt='Spotify pic'
                  fallbackSrc='https://via.placeholder.com/150'
                />
              </Flex>
            ) : (
              <Link href={spotifyAuthURL}>
                <Button>Connect to Spotify</Button>
              </Link>
            )}
          </Box>
          <Box p='4' borderWidth='1px' borderRadius='lg'>
            <Heading as='h2' size='lg'>
              Select a username
            </Heading>

            <FormControl>
              <FormLabel htmlFor='name'>Name</FormLabel>
              <Input
                autoFocus
                name='name'
                placeholder='Your name'
                value={userName}
                onChange={event => setUserName(event.target.value)}
              />
            </FormControl>
          </Box>
          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Create a New Town
            </Heading>
            <Flex p='4'>
              <Box flex='1'>
                <FormControl>
                  <FormLabel htmlFor='townName'>New Town Name</FormLabel>
                  <Input
                    name='townName'
                    placeholder='New Town Name'
                    value={newTownName}
                    onChange={event => setNewTownName(event.target.value)}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl>
                  <FormLabel htmlFor='isPublic'>Publicly Listed</FormLabel>
                  <Checkbox
                    id='isPublic'
                    name='isPublic'
                    isChecked={newTownIsPublic}
                    onChange={e => {
                      setNewTownIsPublic(e.target.checked);
                    }}
                  />
                </FormControl>
              </Box>
              <Box>
                <Button data-testid='newTownButton' onClick={handleCreate}>
                  Create
                </Button>
              </Box>
            </Flex>
          </Box>
          <Heading p='4' as='h2' size='lg'>
            -or-
          </Heading>

          <Box borderWidth='1px' borderRadius='lg'>
            <Heading p='4' as='h2' size='lg'>
              Join an Existing Town
            </Heading>
            <Box borderWidth='1px' borderRadius='lg'>
              <Flex p='4'>
                <FormControl>
                  <FormLabel htmlFor='townIDToJoin'>Town ID</FormLabel>
                  <Input
                    name='townIDToJoin'
                    placeholder='ID of town to join, or select from list'
                    value={townIDToJoin}
                    onChange={event => setTownIDToJoin(event.target.value)}
                  />
                </FormControl>
                <Button data-testid='joinTownByIDButton' onClick={() => handleJoin(townIDToJoin)}>
                  Connect
                </Button>
              </Flex>
            </Box>

            <Heading p='4' as='h4' size='md'>
              Select a public town to join
            </Heading>
            <Box maxH='500px' overflowY='scroll'>
              <Table>
                <TableCaption placement='bottom'>Publicly Listed Towns</TableCaption>
                <Thead>
                  <Tr>
                    <Th>Town Name</Th>
                    <Th>Town ID</Th>
                    <Th>Activity</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPublicTowns?.map(town => (
                    <Tr key={town.townID}>
                      <Td role='cell'>{town.friendlyName}</Td>
                      <Td role='cell'>{town.townID}</Td>
                      <Td role='cell'>
                        {town.currentOccupancy}/{town.maximumOccupancy}
                        <Button
                          onClick={() => handleJoin(town.townID)}
                          disabled={town.currentOccupancy >= town.maximumOccupancy}>
                          Connect
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Stack>
      </form>
    </>
  );
}
