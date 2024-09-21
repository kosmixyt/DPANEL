import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { SSL } from "./ssl";

@Entity()
export class Domain {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name: string;
  @ManyToOne(() => User, (user) => user.domains)
  user: User;
  @ManyToMany(() => SSL, (ssl) => ssl.domains)
  ssl!: SSL[];
  constructor(user: User, name: string) {
    this.user = user;
    this.name = name;
  }
}
