import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './user.model';

@Table({ underscored: true })
export class Session extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  token: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, onDelete: 'CASCADE' })
  user_id: string;

  @BelongsTo(() => User)
  user: User;
}
