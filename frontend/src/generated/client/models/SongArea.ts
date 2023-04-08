/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { Playlist, Track } from 'spotify-web-api-ts/types/types/SpotifyObjects';


export type SongArea = {
    curr_song?: Track;
    comments?: Comment[];
    like_count: number;
    songs_playlist?: Playlist;
    playlist_def?: string;
};

