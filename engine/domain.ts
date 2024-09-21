import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import { Container } from "./container";

@Entity()
export class Domain {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  name!: string;
  @OneToMany(() => Host, (host) => host.domains, { nullable: true })
  nginxConfig!: Host;
  @OneToOne(() => Container, (container) => container.domains, { nullable: true })
  container!: Container;
}
