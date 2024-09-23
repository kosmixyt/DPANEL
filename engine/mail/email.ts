import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Domain } from "../domain";
import dns from "dns";
import { AppDataSource } from "../..";

@Entity()
export class EmailController {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => EmailAccount, (acc) => acc.controller)
  accounts!: EmailAccount[];
  @OneToOne(() => Domain, (domain) => domain.emailController)
  Domain!: Domain;
  @Column()
  Inited!: boolean;

  async Init() { }
}
@Entity()
export class EmailAccount {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @OneToMany(() => EmailController, (controller) => controller.accounts)
  controller!: EmailController;
  @Column()
  name!: string;
  @OneToMany(() => EmailAccount, (alias) => alias.controller)
  alias!: EmailAlias[];

  static async CreateMail(name: string, stralias: string[], controller: EmailController) {
    for (const a of stralias) {
      if (!a.endsWith(controller.Domain.name)) {
        throw new Error("Alias must be in the same domain");
      }
    }
    const account = new EmailAccount();
    account.name = name;
    account.controller = controller;

    for (const a of stralias) {
      const instance = await EmailAlias.CreateAlias(a, account);
    }
    await account.save();
    controller.accounts.push(account);
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
}

@Entity()
export class EmailAlias {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @ManyToOne(() => EmailAccount, (acc) => acc.alias)
  account!: EmailAccount;
  @Column()
  name!: string;

  static async CreateAlias(alias: string, account: EmailAccount) {
    if (!alias.endsWith(account.controller.Domain.name)) {
      throw new Error("Alias must be in the same domain");
    }
    const a = new EmailAlias();
    a.name = alias;
    a.account = account;
    await a.save();
    account.alias.push(a);
    return a;
  }
  async save() {
    await AppDataSource.manager.save(this);
  }
}