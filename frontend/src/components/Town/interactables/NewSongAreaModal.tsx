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
import { useSongAreaController } from '../../../classes/TownController';
import SongArea from './SongArea';
import { Playlist, SongArea as SongAreaModel } from '../../../types/CoveyTownSocket';
import useTownController from '../../../hooks/useTownController';

export default function NewSongAreaModal({
  isOpen,
  close,
  songArea,
}: {
  isOpen: boolean;
  close: () => void;
  songArea: SongArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const songAreaController = useSongAreaController(songArea?.id);

  const [playlistName, setPlaylistName] = useState<string>('');
  const [playlistDescription, setPlaylistDescription] = useState<string>('');
  const [playlistContents, setPlaylistContents] = useState<Playlist | undefined>(undefined);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  const toast = useToast();

  const createPlaylist = useCallback(async () => {
    if (
      (playlistName && songAreaController && playlistContents) ||
      (playlistName && songAreaController && playlistContents && playlistDescription)
    ) {
      console.log('playlistContents: ' + playlistContents);
      const songAreaToCreate: SongAreaModel = {
        comments: [],
        id: songAreaController.id,
        like_count: 0,
        songs_playlist: playlistContents,
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
  }, [
    playlistName,
    playlistContents,
    setPlaylistName,
    coveyTownController,
    songAreaController,
    closeModal,
    toast,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create a playlist in {songAreaController?.id} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createPlaylist();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='title'>Playlist name</FormLabel>
              <Input
                id='title'
                placeholder='Add a name'
                name='title'
                value={playlistName}
                onChange={async e => {
                  setPlaylistName(e.target.value);
                  const newPlaylist = await coveyTownController.createNewPlaylistWithTopSongs();
                  setPlaylistContents(newPlaylist);
                  console.log('playlistContents: ' + playlistContents);
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='topic'>Playlist description</FormLabel>
              <Input
                id='topic'
                placeholder='Add an optional description'
                name='topic'
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
