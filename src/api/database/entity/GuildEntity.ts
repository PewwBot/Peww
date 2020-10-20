import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class GuildEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guildId: string;

  @Column()
  ownerId: string;

  @Column()
  vip: boolean;

}
