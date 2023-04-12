/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Track } from './Track';

export type Playlist = {
    uri: string;
    tracks: Array<Track>;
    owner: string;
    name: string;
    images: Array<string>;
    id: string;
    href: string;
    description: string | null;
};

