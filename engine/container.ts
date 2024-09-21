import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain";
import { AppDataSource } from "..";

@Entity()
export class Container {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  save() {
    AppDataSource.manager.save(this);
  }
  buildNginxConfig(): string {
    return "";
  }
}
