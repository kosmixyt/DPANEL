import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain";
import { AppDataSource } from "..";

@Entity()
export class Container {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @OneToMany(() => Domain, (domain) => domain.container)
  domains!: Domain[];
  save() {
    AppDataSource.manager.save(this);
  }
}
