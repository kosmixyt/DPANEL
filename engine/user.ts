import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "./domain";
import { AppDataSource } from "..";

@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name: string;
  @OneToMany(() => Domain, (domain) => domain.user)
  domains!: Domain[];
  constructor(name: string) {
    this.name = name;
  }
  async insert() {
    await AppDataSource.getRepository(User).insert(this);
    return this;
  }
  static async getAll() {
    return await AppDataSource.getRepository(User).find();
  }
}
