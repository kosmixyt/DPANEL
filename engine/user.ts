import { Column, Entity, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Host } from "./host";
import { AppDataSource, PUBLIC_SERVER_IP, Resolve4, Resolve6, UserData } from "..";
import fs from "fs";
import path from "path";
import { Domain } from "./domain";
import { SSL } from "./ssl";
import dns from "dns"
@Entity()
export class User {
  @PrimaryGeneratedColumn("increment")
  id!: number;
  @Column()
  email!: string;
  @Column()
  name: string;
  @OneToMany(() => Domain, (domain) => domain.user)
  domains!: Domain[];
  @OneToMany(() => SSL, (ssl) => ssl.user)
  SSL!: SSL[];

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
  ssl() {
    return path.join(UserData, this.name, "ssl");
  }
  logs() {
    return path.join(UserData, this.name, "logs");
  }
  async assert() {
    const required_paths = [path.join(UserData, this.name), this.ssl(), this.logs()];
    for (const required_path of required_paths) {
      if (!fs.existsSync(required_path)) {
        fs.mkdirSync(required_path);
      }
    }
  }
  async getAllHosts(relations: string[] = []) {
    const hosts = AppDataSource.getRepository(Host).find({
      relations: relations,
      where: {},
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
  async save() {
    await AppDataSource.manager.save(this);
  }
  async allocDomain(name: string, emailDisabled = false): Promise<Domain> {
    const domain = new Domain();
    domain.name = name;
    domain.emailDisabled = emailDisabled;
    domain.user = this;


    await domain.save();
    return domain;
  }
  async createHost(domains: Domain[], withSSl = false): Promise<() => void> {
    for (const domain of domains) {
      if (domain.user.id !== this.id) {
        throw new Error("Domain does not belong to this user");
      }
      if (domain.nginxConfig) {
        throw new Error("Domain already has a host");
      }
    }
    const host = new Host();
    host.domains = domains;
    for (const domain of domains) {
      const ips = (await Promise.all([Resolve4(domain.name), Resolve6(domain.name)])).flat()
      if (!ips.includes(PUBLIC_SERVER_IP)) {
        host.domains = [];
        throw new Error("Domain does not resolve to this server");
      }
    }
    await Promise.all(domains.map((domain) => { domain.nginxConfig = host; return domain.save() }));
    if (withSSl) await host.requestSSL(this)
    host.defaultConfig();
    host.assert();
    await host.save();
    return host.writeConfig.bind(host);
  }
}
