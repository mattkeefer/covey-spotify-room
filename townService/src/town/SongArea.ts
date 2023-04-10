import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  Comment,
  SongArea as SongAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { Playlist, Track } from 'spotify-web-api-ts/types/types/SpotifyObjects';

export default class SongArea extends InteractableArea{
    private _curr_song?: Track;

    private _comments?: Comment[];

    private _like_count: number;

    private _songs_playlist?: Playlist;
    
    private _playlist_def?: string;
  
   public getCurrentSong(){
       return this._curr_song;
   }

   public getComments(){
       return this._comments;
   }

   public getLikeCount(){
       return this._like_count;
   }

   public getSongsPlaylist(){
       return this._songs_playlist;
   }

   public getPlaylistDescription(){
       return this._playlist_def;
   }

    /**
   * Creates a new SongArea
   *
   * @param viewingArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    {id, curr_song, comments, like_count, songs_playlist, playlist_def }: SongAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._curr_song = curr_song;
    this._comments = comments;
    this._like_count = like_count;
    this._songs_playlist = songs_playlist;
    this._playlist_def = playlist_def;
  }

  /**
   * Updates the state of this SongArea, setting the song, comments and likes, playlist and playlist desc properties
   *
   * @param songArea updated model
   */
  public updateModel(updatedModel: SongAreaModel) {
    this._curr_song = updatedModel.curr_song;
    this._comments = updatedModel.comments;
    this._like_count = updatedModel.like_count;
    this._songs_playlist = updatedModel.songs_playlist;
    this._playlist_def = updatedModel.playlist_def;
  }

  /**
   * Convert this SongArea instance to a simple SongAreaModel suitable for
   * transporting over a socket to a client (i.e., serializable).
   */
  public toModel(): SongAreaModel {
    return {
      id: this.id,
      curr_song: this._curr_song,
      comments: this._comments,
      like_count: this._like_count,
      songs_playlist: this._songs_playlist,
      playlist_def: this._playlist_def
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
        this._curr_song = undefined;
        this._comments = undefined;
        this._like_count = 0;
        this._songs_playlist = undefined;
        this._playlist_def = undefined;
      this._emitAreaChanged();
    }
  }


/**
   * Creates a new SongArea object that will represent a SongArea object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    townEmitter: TownEmitter,
  ): SongArea {
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
      { id: mapObject.name, curr_song: undefined, comments: [], like_count : 0, songs_playlist : undefined },
      box,
      townEmitter,
    );
  }
}