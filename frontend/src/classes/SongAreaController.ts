import { EventEmitter } from 'events';
import { useEffect, useState } from 'react';
import { Playlist, Track } from 'spotify-web-api-ts/types/types/SpotifyObjects';
import TypedEventEmitter from 'typed-emitter';
import { SongArea as SongAreaModel, Comment } from '../types/CoveyTownSocket';

/**
 * The events that a SongAreaController can emit
 */
export type SongAreaEvents = {
  songCurrSongChange: (curr_song: Track | undefined) => void;
  songCommentsChange: (comments: Comment[] | undefined) => void;
  songLikeCountChange: (like_count: number) => void;
  songsSongsPlaylist: (songs_playlist: Playlist | undefined) => void;
  songsPlaylistDef: (playlist_def: string | undefined) => void;
};

/**
 * A SongAreaController manages the state for a SongArea in the frontend app, serving as a bridge between the songs
 * that are being displayed in the user's browser and the backend TownService
 *
 * The SongAreaController implements callbacks that handle events from the playlist in this browser window, and
 * emits updates when the state is updated, @see SongAreaEvents
 */
export default class SongAreaController extends (EventEmitter as new () => TypedEventEmitter<SongAreaEvents>) {
  private _model: SongAreaModel;

  /**
   * Constructs a new SongAreaController, initialized with the state of the
   * provided SongAreaModel.
   *
   * @param SongAreaModel The song area model that this controller should represent
   */
  constructor(songAreaModel: SongAreaModel) {
    super();
    this._model = songAreaModel;
  }

  /**
   * The ID of the song area represented by this song area controller
   * This property is read-only: once a SongAreaController is created, it will always be
   * tied to the same song area ID.
   */
  public get id(): string {
    return this._model.id;
  }

  /**
   * The current song playing, or undefined if there is not one.
   */
  public get curr_song(): Track | undefined {
    return this._model.curr_song;
  }

  public set curr_song(curr_song: Track | undefined) {
    if (this._model.curr_song !== curr_song) {
      this._model.curr_song = curr_song;
      this.emit('songCurrSongChange', curr_song);
    }
  }

  /**
   * The comments in this song area, or undefined if there are not any.
   */
  public get comments(): Comment[] | undefined {
    return this._model.comments;
  }

  public set comments(comments: Comment[] | undefined) {
    if (this._model.comments !== comments) {
      this._model.comments = comments;
      this.emit('songCommentsChange', comments);
    }
  }

  /**
   * The number of likes
   */
  public get like_count(): number {
    return this._model.like_count;
  }

  public set like_count(like_count: number) {
    if (this._model.like_count !== like_count && like_count > 0) {
      this._model.like_count = like_count;
      this.emit('songLikeCountChange', like_count);
    }
  }


  public get songs_playlist(): Playlist | undefined {
    return this._model.songs_playlist;
  }

  public set songs_playlist(songs_playlist: Playlist | undefined) {
    if (this._model.songs_playlist !== songs_playlist) {
      this._model.songs_playlist = songs_playlist;
      this.emit('songsSongsPlaylist', songs_playlist);
    }
  }


  public get playlist_def(): string | undefined {
    return this._model.playlist_def;
  }

  public set playlist_def(playlist_def: string | undefined) {
    if (this._model.playlist_def !== playlist_def) {
      this._model.playlist_def = playlist_def;
      this.emit('songsPlaylistDef', playlist_def);
    }
  }


  /**
   * @returns SongAreaModel that represents the current state of this SongAreaController
   */
  public songAreaModel(): SongAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this song area controller's model, setting the fields
   * image, stars, and title from the updatedModel
   *
   * @param updatedModel
   */
  public updateFrom(updatedModel: SongAreaModel): void {
    // note: this calls the setters; really we're updating the model
    this.curr_song = updatedModel.curr_song;
    this.comments = updatedModel.comments;
    this.like_count = updatedModel.like_count;
    this.songs_playlist = updatedModel.songs_playlist;
    this.playlist_def = updatedModel.playlist_def;
  }
}

/**
 * A hook that returns the number of stars for the song area with the given controller
 */
export function useCurrSong(controller: SongAreaController): Track | undefined {
  const [curr_song, setcurr_song] = useState(controller.curr_song);
  useEffect(() => {
    controller.addListener('songCurrSongChange', setcurr_song);
    return () => {
      controller.removeListener('songCurrSongChange', setcurr_song);
    };
  }, [controller]);
  return curr_song;
}

export function useComments(controller: SongAreaController): Comment[] | undefined {
  const [comments, setComments] = useState(controller.comments);
  useEffect(() => {
    controller.addListener('songCommentsChange', setComments);
    return () => {
      controller.removeListener('songCommentsChange', setComments);
    };
  }, [controller]);
  return comments;
}

export function useLikeCount(controller: SongAreaController): number {
  const [like_count, setLikeCount] = useState(controller.like_count);
  useEffect(() => {
    controller.addListener('songLikeCountChange', setLikeCount);
    return () => {
      controller.removeListener('songLikeCountChange', setLikeCount);
    };
  }, [controller]);
  return like_count;
}

export function useSongsPlaylist(controller: SongAreaController): Playlist | undefined {
  const [songs_playlist, setSongsPlaylist] = useState(controller.songs_playlist);
  useEffect(() => {
    controller.addListener('songsSongsPlaylist', setSongsPlaylist);
    return () => {
      controller.removeListener('songsSongsPlaylist', setSongsPlaylist);
    };
  }, [controller]);
  return songs_playlist;
}

export function usePlaylistDef(controller: SongAreaController): string | undefined {
  const [playlist_def, setSongsPlaylist] = useState(controller.playlist_def);
  useEffect(() => {
    controller.addListener('songsPlaylistDef', setSongsPlaylist);
    return () => {
      controller.removeListener('songsPlaylistDef', setSongsPlaylist);
    };
  }, [controller]);
  return playlist_def;
}

