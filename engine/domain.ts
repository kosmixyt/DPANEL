import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import { Container } from "./container";
import { SSL } from "./ssl";

@Entity()
export class Domain {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name!: string;
  @OneToMany(() => Host, (host) => host.domains, { nullable: true })
  nginxConfig!: Host;
  @OneToMany(() => SSL, (ssl) => ssl.domains, { nullable: true })
  ssl!: SSL;
  emailDisabled!: boolean;
  getController(): Host {
    return this.nginxConfig;
  }
}
