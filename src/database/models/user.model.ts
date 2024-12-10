import { ConfigService } from '@nestjs/config';
import { BeforeCreate, BeforeUpdate, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { Session } from './session.model';
import { Favorite } from './favorites.model';

enum Role {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}
@Table({ underscored: true })
export class User extends Model {
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
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM(Role.ADMIN, Role.EDITOR, Role.VIEWER),
    allowNull: false,
  })
  role: Role;

  @HasMany(() => Session)
  session: Session;

  @HasMany(() => Favorite)
  favorite: Favorite;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    const configService = new ConfigService();
    const saltRounds = Number(configService.get('BCRYPT_SALT'));
    console.log('here', Number(configService.get('BCRYPT_SALT')));
    if (user.password) {
      user.password = await bcrypt.hash(user.password, saltRounds);
    }
  }
}
