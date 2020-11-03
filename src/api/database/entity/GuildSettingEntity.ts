import { Column, Entity, EntityOptions, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'GuildSettings',
} as EntityOptions)
export class GuildSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guildId: string;

  @Column()
  key: string;

  @Column('simple-json', { nullable: true })
  data: { };
}
