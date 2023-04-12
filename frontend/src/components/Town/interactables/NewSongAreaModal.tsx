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
  import { useInteractable } from '../../../classes/TownController';
  import { SongArea } from '../../../generated/client';
  import useTownController from '../../../hooks/useTownController';
  
  export default function NewSongAreaModal(): JSX.Element {
    const coveyTownController = useTownController();
    const newSongArea = useInteractable('songArea');
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
  
    const createSongArea = useCallback(async () => {
      if ((playlistName && newSongArea) || (playlistName && playlistDescription && newSongArea)) {
        const songAreaToCreate: SongArea = {
            comments: [],
            songs_playlist: {
                description: playlistDescription,
                href: "",
                id: "",
                images: [],
                name: playlistName,
                owner: "",
                tracks: [],
                uri: "",
            },
            id: newSongArea.name,
            like_count: 0,
        };
        try {
          await coveyTownController.createSongArea(songAreaToCreate);
          toast({
            title: 'Playlist Created!',
            status: 'success',
          });
          setPlaylistName('');
          setPlaylistDescription('');
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
    }, [playlistName, setPlaylistName, playlistDescription, setPlaylistDescription, coveyTownController, newSongArea, closeModal, toast]);
  
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeModal();
          coveyTownController.unPause();
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a playlist in {newSongArea?.name} </ModalHeader>
          <ModalCloseButton />
          <form
            onSubmit={ev => {
              ev.preventDefault();
              createSongArea();
            }}>
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel htmlFor='topic'>Playlist name</FormLabel>
                <Input
                  id='topic'
                  placeholder='Add a name'
                  name='topic'
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
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
              <Button colorScheme='blue' mr={3} onClick={createSongArea}>
                Create
              </Button>
              <Button onClick={closeModal}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    );
  }