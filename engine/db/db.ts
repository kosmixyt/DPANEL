import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { DbPermission } from "./rights";
import { AppDataSource } from "../..";

@Entity()
export class Database {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  name!: string;
  @ManyToOne(() => DbPermission, (perm) => perm.dbs)
  permissions!: DbPermission[];
  static async create(name: string): Promise<Database> {
    const db = new Database();
    db.name = name;
    await AppDataSource.manager.query(`CREATE DATABASE ${name}`);
    await db.save();
    return db;
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
}
