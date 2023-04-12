import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable, useSongAreaController } from '../../../classes/TownController';
import SongArea from './SongArea';
import { Playlist, SongArea as SongAreaModel } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';

export default function NewSongAreaModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newSongArea: SongArea | undefined = useInteractable('songArea');

  const [playlistName, setPlaylistName] = useState<string>('');
  const [playlistDescription, setPlaylistDescription] = useState<string>('');

  const isOpen = newSongArea !== undefined;

  useEffect(() => {
    if (newSongArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newSongArea]);

  const closeModal = useCallback(() => {
    if (newSongArea) {
      coveyTownController.interactEnd(newSongArea);
    }
  }, [coveyTownController, newSongArea]);

  const toast = useToast();

  const createPlaylist = useCallback(async () => {
    if ((playlistName && newSongArea) || (playlistName && newSongArea && playlistDescription)) {
      const playlistContents: Playlist = await coveyTownController.createNewPlaylistWithTopSongs();
      const songAreaToCreate: SongAreaModel = {
        comments: [],
        id: newSongArea.id,
        like_count: 0,
        songs_playlist: playlistContents,
        playlist_def: '',
      };
      try {
        await coveyTownController.createSongArea(songAreaToCreate);
        toast({
          title: 'Playlist Created!',
          status: 'success',
        });
        setPlaylistName('');
        coveyTownController.unPause();
        closeModal();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create playlist',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [playlistName, newSongArea, playlistDescription, coveyTownController, toast, closeModal]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a playlist in {newSongArea?.id} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createPlaylist();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='name'>Playlist name</FormLabel>
              <Input
                id='name'
                placeholder='Add a name'
                name='name'
                value={playlistName}
                onChange={async e => {
                  setPlaylistName(e.target.value);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='playlist_def'>Playlist description</FormLabel>
              <Input
                id='playlist_def'
                placeholder='Add an optional description'
                name='playlist_def'
                value={playlistDescription}
                onChange={e => setPlaylistDescription(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createPlaylist}>
              Create
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
