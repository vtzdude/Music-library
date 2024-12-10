import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Album } from './album.model';
import { Track } from './track.model';

@Table({ underscored: true })
export class Artist extends Model {
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
    defaultValue: 0,
  })
  grammy: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  hidden: boolean;

  @HasMany(() => Album)
  album: Album;

  @HasMany(() => Track)
  track: Track;
}
