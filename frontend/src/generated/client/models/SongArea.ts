/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Comment } from './Comment';
import type { Playlist } from './Playlist';
import type { Track } from './Track';

export type SongArea = {
    id: string;
    curr_song?: Track;
    comments?: Array<Comment>;
    like_count: number;
    songs_playlist?: Playlist;
    playlist_def?: string;
};

