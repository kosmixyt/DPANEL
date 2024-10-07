import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import * as fs from "fs"

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
  static ExistVersion(version : string) : boolean {
    return  fs.existsSync("/var/run/php/php" + version + "-fpm.sock")
  }
}
