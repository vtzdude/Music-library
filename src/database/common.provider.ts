import { Album } from './models/album.model';
import { Artist } from './models/artist.model';
import { Favorite } from './models/favorites.model';
import { Session } from './models/session.model';
import { Track } from './models/track.model';
import { User } from './models/user.model';

export const CommonProviders = [
  {
    useValue: User,
    provide: 'USER',
  },
  {
    useValue: Session,
    provide: 'SESSION',
  },
  {
    useValue: Artist,
    provide: 'ARTIST',
  },
  {
    useValue: Album,
    provide: 'ALBUM',
  },
  {
    useValue: Track,
    provide: 'TRACK',
  },
  {
    useValue: Favorite,
    provide: 'FAVORITE',
  },
];
