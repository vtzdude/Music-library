import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './user.model';
import { Album } from './album.model';
import { Artist } from './artist.model';
import { Track } from './track.model';

export enum Category {
  ALBUM = 'album',
  ARTIST = 'artist',
  TRACK = 'track',
}
@Table({ underscored: true })
export class Favorite extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.ENUM(Category.ALBUM, Category.ARTIST, Category.TRACK),
    allowNull: false,
  })
  category: Category;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  item_id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, onDelete: 'CASCADE' })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Album, { foreignKey: 'item_id', constraints: false })
  album: Album;

  @BelongsTo(() => Artist, { foreignKey: 'item_id', constraints: false })
  artist: Artist;

  @BelongsTo(() => Track, { foreignKey: 'item_id', constraints: false })
  track: Track;
}
