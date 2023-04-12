import { Modal, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react';
import React, { useCallback, useEffect } from 'react';
import { useInteractable } from '../../../classes/TownController';
import SongArea from './SongArea';
import useTownController from '../../../hooks/useTownController';

export default function NewSongAreaModal(): JSX.Element {
  const coveyTownController = useTownController();
  const newSongArea: SongArea | undefined = useInteractable('songArea');

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <iframe
          src={`https://open.spotify.com/embed/playlist/${coveyTownController.playlist?.id}?utm_source=generator&theme=0`}
          width='100%'
          height='550'
          frameBorder='0'
          allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'
          loading='lazy'></iframe>
      </ModalContent>
    </Modal>
  );
}
