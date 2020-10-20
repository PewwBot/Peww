import { Column, Entity, EntityOptions, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'Guilds',
} as EntityOptions)
export class GuildEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guildId: string;

  @Column()
  ownerId: string;

  @Column()
  premium: boolean;

  @Column('simple-array')
  customPrefix: string[];
}
