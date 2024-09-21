import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { AppDataSource } from "..";
import { Host } from "./host";

@Entity()
export class SSL {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToMany(() => Host, (host) => host.ssl)
  domains!: Host[];
  @Column()
  CreatedAt: Date = new Date();
  @Column()
  ExpiresAt: Date = new Date();
  constructor() {}
  static create(domains: Host[], user: User): SSL {
    return new SSL();
  }
  save() {
    AppDataSource.manager.save(this);
  }
}
