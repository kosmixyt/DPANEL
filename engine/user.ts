import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import { AppDataSource, UserData } from "..";
import fs from "fs";
import path from "path";
import { Domain } from "./domain";
@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  name: string;
  @OneToMany(() => Host, (host) => host.user)
  domains!: Host[];

  constructor(name: string) {
    this.name = name;
  }
  async Init() {
    await AppDataSource.getRepository(User).insert(this);
    return this;
  }
  root() {
    return path.join(UserData, this.name);
  }
  async assert() {
    const required_paths = [path.join(UserData, this.name), path.join(UserData, this.name, "ssl")];
    for (const required_path of required_paths) {
      if (!fs.existsSync(required_path)) {
        fs.mkdirSync(required_path);
      }
    }
  }
  async getAllHosts(relations: string[] = []) {
    const hosts = AppDataSource.getRepository(Host).find({
      relations: relations,
      where: { user: { id: this.id } },
    });
    return hosts;
  }
  async getAllDomains(): Promise<Domain[]> {
    const hosts = await this.getAllHosts(["domains"]);
    const domains = hosts.map((host) => host.domains).flat();
    return domains;
  }
  getAbsolute(gived: string) {
    const absolute_path = path.resolve(path.join(this.root(), gived));
    if (!absolute_path.startsWith(this.root())) {
      throw new Error("Invalid  path the path must be inside the user's root directory");
    }
    return absolute_path;
  }
  mkdir(name: string) {
    fs.mkdirSync(this.getAbsolute(name));
  }
  rm(name: string, props: { recursive: boolean }) {
    fs.rmSync(this.getAbsolute(name), props);
  }
  createReadStream(name: string) {
    return fs.createReadStream(this.getAbsolute(name));
  }
  createWriteStream(name: string) {
    return fs.createWriteStream(this.getAbsolute(name));
  }
  stats(name: string) {
    return fs.statSync(this.getAbsolute(name));
  }
  static async getById(id: number) {
    return await AppDataSource.getRepository(User).findOne({ where: { id: id } });
  }
  static async getAll() {
    return await AppDataSource.getRepository(User).find();
  }
  save() {
    AppDataSource.manager.save(this);
  }
  createHost(domains: string[]) {
    const host = new Host();
    host.user = this;
    host.domains = domains.map((domain) => {
      const domain_instance = new Domain();
      domain_instance.nginxConfig = host;
      domain_instance.name = domain;
      return domain_instance;
    });
    host.assert();
    host.save();
  }
}
