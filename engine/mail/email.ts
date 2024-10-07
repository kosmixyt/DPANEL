import { Column, Entity, EntityManager, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "../domain";
import * as dns from "dns";
import { AppDataSource } from "../..";
import { sha512 } from "sha512-crypt-ts";

@Entity()
export class EmailController {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  InDbId!: number;
  @ManyToOne(() => EmailAccount, (acc) => acc.controller)
  accounts!: EmailAccount[];
  @OneToOne(() => Domain, (domain) => domain.emailController)
  Domain!: Domain;
  @Column()
  Inited!: boolean;

  async Init() {}
}
@Entity()
export class EmailAccount {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @OneToMany(() => EmailController, (controller) => controller.accounts)
  controller!: EmailController;
  @Column()
  InDbId!: number;
  @Column()
  name!: string;
  @Column({ length: 100 })
  password!: string;
  // @OneToMany(() => EmailAccount, (alias) => alias.controller)
  // alias!: EmailAlias[];
  //@name must be in the form of "{name}@{controller.domain.name}"
  static async CreateMail(name: string, password: string, controller: EmailController) {
    const account = new EmailAccount();
    account.name = name;
    account.controller = controller;
    account.password = sha512.crypt(password, "saltsalt");
    const out = await AppDataSource.manager.query(
      `INSERT INTO mailserver.virtual_users (domain_id, password , email) VALUES ('${controller.InDbId}', '${account.password}', '${name}@${controller.Domain.name}');`
    );
    await account.save();
    controller.accounts.push(account);
  }
  async setPassword(password: string) {
    this.password = sha512.crypt(password, "saltsalt");
    await AppDataSource.manager.query(
      `UPDATE mailserver.virtual_users SET password = '${this.password}' WHERE email = '${this.name}@${this.controller.Domain.name}';`
    );
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
}

// @Entity()
// export class EmailAlias {
//   @PrimaryGeneratedColumn("increment")
//   id!: number;
//   @ManyToOne(() => EmailAccount, (acc) => acc.alias)
//   account!: EmailAccount;
//   @Column()
//   name!: string;

//   static async CreateAlias(alias: string, account: EmailAccount) {
//     if (!alias.endsWith(account.controller.Domain.name)) throw new Error("Alias must be in the same domain");
//     const a = new EmailAlias();
//     a.name = alias;
//     a.account = account;
//     await a.save();
//     account.alias.push(a);
//     return a;
//   }
//   async save() {
//     await AppDataSource.manager.save(this);
//   }
// }
