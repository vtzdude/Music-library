import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Artist } from './artist.model';
import { Album } from './album.model';

@Table({ underscored: true })
export class Track extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  duration: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  hidden: boolean;

  @ForeignKey(() => Artist)
  @Column({ type: DataType.UUID, allowNull: false, onDelete: 'CASCADE' })
  artist_id: string;

  @BelongsTo(() => Artist)
  artist: Artist;

  @ForeignKey(() => Album)
  @Column({ type: DataType.UUID, allowNull: false, onDelete: 'CASCADE' })
  album_id: string;

  @BelongsTo(() => Album)
  album: Album;
}
