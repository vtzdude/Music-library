import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Artist } from './artist.model';
import { Track } from './track.model';

@Table({ underscored: true })
export class Album extends Model {
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
  year: string;

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

  @HasMany(() => Track)
  track: Track;
}
