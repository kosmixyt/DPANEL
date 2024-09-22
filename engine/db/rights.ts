import { Column, Entity, OneToMany } from "typeorm";
import { DbUser } from "./user";
import { Database } from "./db";
import { AppDataSource } from "../..";

@Entity()
export class DbPermission {
  id!: number;
  @OneToMany(() => DbUser, (dbuser) => dbuser.permissions)
  user!: DbUser;
  @OneToMany(() => Database, (db) => db.permissions)
  dbs!: Database[];
  @Column()
  perms!: string;
  setPerms(perms: string[]) {
    this.perms = perms.join(",");
  }
  Perms(): string[] {
    return this.perms.split(",");
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
  async addPerms(perms: string[]) {
    if (this.Perms().some((perm) => perms.includes(perm))) {
      throw new Error("Permission already exists");
    }
    this.perms = [...this.Perms(), ...perms].join(",");
    // execute sql query
    await this.save();
  }
  static async create(user: DbUser, dbs: Database[], perms: string[]): Promise<DbPermission> {
    const perm = new DbPermission();
    perm.user = user;
    perm.dbs = dbs;
    await AppDataSource.manager.query(`GRANT ${perms.join(",")} ON ${dbs.map((db) => db.name).join(",")} TO ${user.name}`);
    perm.perms = perms.join(",");
    await perm.save();
    user.permissions.push(perm);
    return perm;
  }
}

const perms = [
  "SELECT",
  "INSERT",
  "UPDATE",
  "DELETE",
  "CREATE",
  "DROP",
  "INDEX",
  "ALTER",
  "CREATE TEMPORARY TABLES",
  "LOCK TABLES",
  "CREATE VIEW",
  "SHOW VIEW",
  "CREATE ROUTINE",
  "ALTER ROUTINE",
  "EXECUTE",
  "CREATE USER",
  "EVENT",
  "TRIGGER",
];
