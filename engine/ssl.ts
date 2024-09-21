import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain";

@Entity()
export class SSL {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToMany(() => Domain, (domain) => domain.ssl)
  domains!: Domain[];
  @Column()
  CreatedAt: Date = new Date();
  @Column()
  ExpiresAt: Date = new Date();
  constructor() {}
}
