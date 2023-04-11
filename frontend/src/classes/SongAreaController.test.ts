import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { SongArea } from '../generated/client';
import TownController from './TownController';
import { Comment, Playlist, Track } from '../types/CoveyTownSocket';
import SongAreaController, { SongAreaEvents } from './SongAreaController';

describe('SongAreaController', () => {
  // A valid SongArea to be reused within the tests
  let testArea: SongAreaController;
  let testAreaModel: SongArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<SongAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      curr_song: mock<Track>({ uri: 'track:1234567890' }),
      comments: mock<Comment[]>(),
      like_count: 1,
      songs_playlist: mock<Playlist>({ id: '12345' }),
      playlist_def: nanoid(),
    };
    testArea = new SongAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.songCurrSongChange);
    mockClear(mockListeners.songCommentsChange);
    mockClear(mockListeners.songLikeCountChange);
    mockClear(mockListeners.songsSongsPlaylist);
    mockClear(mockListeners.songsPlaylistDef);
    testArea.addListener('songCurrSongChange', mockListeners.songCurrSongChange);
    testArea.addListener('songCommentsChange', mockListeners.songCommentsChange);
    testArea.addListener('songLikeCountChange', mockListeners.songLikeCountChange);
    testArea.addListener('songsSongsPlaylist', mockListeners.songsSongsPlaylist);
    testArea.addListener('songsPlaylistDef', mockListeners.songsPlaylistDef);
  });
  describe('Setting playlist_def property', () => {
    it('updates the property and emits a songsPlaylistDef event if the property changes', () => {
      const newDef = 'playlist def';
      testArea.playlist_def = newDef;
      expect(mockListeners.songsPlaylistDef).toBeCalledWith(newDef);
      expect(testArea.playlist_def).toEqual(newDef);
    });
    it('does not emit a songsPlaylistDef event if the playlist_def property does not change', () => {
      testArea.playlist_def = testAreaModel.playlist_def;
      expect(mockListeners.songsPlaylistDef).not.toBeCalled();
    });
  });
  describe('Setting songs_playlist property', () => {
    it('updates the property and emits a songsSongsPlaylist event if the property changes', () => {
      const newPlaylist = mock<Playlist>();
      testArea.songs_playlist = newPlaylist;
      expect(mockListeners.songsSongsPlaylist).toBeCalledWith(newPlaylist);
      expect(testArea.songs_playlist).toEqual(newPlaylist);
    });
    it('does not emit a songsSongsPlaylist event if the playlist property does not change', () => {
      testArea.songs_playlist = testAreaModel.songs_playlist;
      expect(mockListeners.songsSongsPlaylist).not.toBeCalled();
    });
  });
  describe('Setting like_count property', () => {
    it('updates the property and emits a songLikeCountChange event if the property changes', () => {
      const newCount = ++testArea.like_count;
      testArea.like_count = newCount;
      expect(mockListeners.songLikeCountChange).toBeCalledWith(newCount);
      expect(testArea.like_count).toEqual(newCount);
    });
    it('does not emit a songLikeCountChange event if the like_count property does not change', () => {
      testArea.like_count = testAreaModel.like_count;
      expect(mockListeners.songLikeCountChange).not.toBeCalled();
    });
  });
  describe('Setting comments property', () => {
    it('updates the property and emits a songCommentsChange event if the property changes', () => {
      const newComments = mock<Comment[]>();
      testArea.comments = newComments;
      expect(mockListeners.songCommentsChange).toBeCalledWith(newComments);
      expect(testArea.comments).toEqual(newComments);
    });
    it('does not emit a songCommentsChange event if the comments property does not change', () => {
      testArea.comments = testAreaModel.comments;
      expect(mockListeners.songCommentsChange).not.toBeCalled();
    });
  });
  describe('Setting curr_song property', () => {
    it('updates the property and emits a songCurrSongChange event if the property changes', () => {
      const newCurrSong = mock<Track>();
      testArea.curr_song = newCurrSong;
      expect(mockListeners.songCurrSongChange).toBeCalledWith(newCurrSong);
      expect(testArea.curr_song).toEqual(newCurrSong);
    });
    it('does not emit a songCurrSongChange event if the curr_song property does not change', () => {
      testArea.curr_song = testAreaModel.curr_song;
      expect(mockListeners.songCurrSongChange).not.toBeCalled();
    });
  });
  describe('songAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.songAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates all the properties', () => {
      const newModel: SongArea = {
        id: nanoid(),
        curr_song: mock<Track>({ uri: 'track:1111111111' }),
        comments: mock<Comment[]>(),
        like_count: testAreaModel.like_count + 1,
        songs_playlist: mock<Playlist>({ id: '22222' }),
        playlist_def: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.curr_song).toEqual(newModel.curr_song);
      expect(testArea.comments).toEqual(newModel.comments);
      expect(testArea.like_count).toEqual(newModel.like_count);
      expect(testArea.songs_playlist).toEqual(newModel.songs_playlist);
      expect(testArea.playlist_def).toEqual(newModel.playlist_def);
      expect(mockListeners.songCurrSongChange).toBeCalledWith(newModel.curr_song);
      expect(mockListeners.songCommentsChange).toBeCalledWith(newModel.comments);
      expect(mockListeners.songLikeCountChange).toBeCalledWith(newModel.like_count);
      expect(mockListeners.songsSongsPlaylist).toBeCalledWith(newModel.songs_playlist);
      expect(mockListeners.songsPlaylistDef).toBeCalledWith(newModel.playlist_def);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: SongArea = {
        id: nanoid(),
        curr_song: mock<Track>({ uri: 'track:1234599999' }),
        comments: mock<Comment[]>(),
        like_count: 1,
        songs_playlist: mock<Playlist>({ id: '33333' }),
        playlist_def: nanoid(),
      };
      testArea.updateFrom(newModel);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
