import { Heading, StackDivider, VStack } from '@chakra-ui/react';
import React from 'react';
import ConversationAreasList from './ConversationAreasList';
import PlayersList from './PlayersList';
import SpotifyDataTest from './SpotifyDataList';
import useTownController from '../../hooks/useTownController';
import { SongArea } from '../../types/CoveyTownSocket';
import SongAreaController from '../../classes/SongAreaController';
import { useSongAreaController } from '../../classes/TownController';

export default function SocialSidebar(): JSX.Element {
  const townController = useSongAreaController();
  return (
    <VStack
      align='left'
      spacing={2}
      border='2px'
      padding={2}
      marginLeft={2}
      borderColor='gray.500'
      height='100%'
      divider={<StackDivider borderColor='gray.200' />}
      borderRadius='4px'>
      <Heading fontSize='xl' as='h1'>
        Players In This Town
      </Heading>
      <PlayersList />
      <ConversationAreasList />
      <SpotifyDataTest controller={townController} />
    </VStack>
  );
}
