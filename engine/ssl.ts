import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { AppDataSource } from "..";
import { Host } from "./host";
import { Domain } from "./domain";

@Entity()
export class SSL {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  CreatedAt: Date = new Date();
  @Column()
  ExpiresAt: Date = new Date();
  @OneToOne(() => Host, (host) => host.SSL)
  host!: Host;
  @ManyToOne(() => Domain, (user) => user.ssl)
  domains!: Domain[];
  constructor() {}
  static create(domains: Host[], user: User): SSL {
    return new SSL();
  }
  save() {
    AppDataSource.manager.save(this);
  }
}
