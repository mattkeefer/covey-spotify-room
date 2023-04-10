import { Playlist, Track } from 'spotify-web-api-ts/types/types/SpotifyObjects';
import { Comment } from '../../../types/CoveyTownSocket';

/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SongArea = {
    curr_song?: Track;
    comments?: Comment[];
    like_count: number;
    songs_playlist?: Playlist;
    playlist_def?: string;
};

