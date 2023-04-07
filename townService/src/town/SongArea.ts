import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import { SpotifyWebApi } from 'spotify-web-api-ts/types';
import { Playlist, Track } from 'spotify-web-api-ts/types/types/SpotifyObjects';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  Comment,
  SongArea as SongAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class SongArea extends InteractableArea {
  private _currentSong?: Track;

  private _comments?: Comment[];

  private _likeCount: number;

  private _songsPlaylist?: Playlist;

  private _playlistDef?: string;

  public getCurrentSong() {
    return this._currentSong;
  }

  public getComments() {
    return this._comments;
  }

  public getLikeCount() {
    return this._likeCount;
  }

  public getSongsPlaylist() {
    return this._songsPlaylist;
  }

  public getPlaylistDescription() {
    return this._playlistDef;
  }

  /**
   * Creates a new SongArea
   *
   * @param viewingArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, curr_song, comments, like_count, songs_playlist, playlist_def }: SongAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._currentSong = curr_song;
    this._comments = comments;
    this._likeCount = like_count;
    this._songsPlaylist = songs_playlist;
    this._playlistDef = playlist_def;
  }

  /**
   * Updates the state of this SongArea, setting the song, comments and likes, playlist and playlist desc properties
   *
   * @param posterSessionArea updated model
   */
  public updateModel(updatedModel: SongAreaModel) {
    this._currentSong = updatedModel.curr_song;
    this._comments = updatedModel.comments;
    this._likeCount = updatedModel.like_count;
    this._songsPlaylist = updatedModel.songs_playlist;
    this._playlistDef = updatedModel.playlist_def;
  }

  /**
   * Convert this SongArea instance to a simple SongAreaModel suitable for
   * transporting over a socket to a client (i.e., serializable).
   */
  public toModel(): SongAreaModel {
    return {
      id: this.id,
      curr_song: this._currentSong,
      comments: this._comments,
      like_count: this._likeCount,
      songs_playlist: this._songsPlaylist,
      playlist_def: this._playlistDef,
    };
  }

  /**
   * Removes a player from this viewing area.
   *
   * When the last player leaves, this method clears the video of this area and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._currentSong = undefined;
      this._comments = undefined;
      this._likeCount = 0;
      this._songsPlaylist = undefined;
      this._playlistDef = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Creates a new SongArea object that will represent a SongArea object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): SongArea {
    if (!mapObject.width || !mapObject.height) {
      throw new Error('missing width/height for map object');
    }
    const box = {
      x: mapObject.x,
      y: mapObject.y,
      width: mapObject.width,
      height: mapObject.height,
    };
    return new SongArea(
      {
        id: mapObject.name,
        curr_song: undefined,
        comments: undefined,
        like_count: 0,
        songs_playlist: undefined,
      },
      box,
      townEmitter,
    );
  }
}
