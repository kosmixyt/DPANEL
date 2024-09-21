import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";

@Entity()
export class PhpConfig {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  version!: string;
  @Column()
  memoryLimit!: string;
  @OneToOne(() => Host, (host) => host.Php)
  Domain!: Host;
  @Column()
  socket!: string;
}
