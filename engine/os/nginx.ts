import { NginxConfigPath } from "../..";
import { Host } from "../host";
import { User } from "../user";
import * as child_process from "child_process";
import * as path from "path";

export function BuildConfig(host: Host, user: User): string {
  const required = [host.Php, host.SSL, host.ReverseProxies, host.Redirects, host.ErrorCodePages];
  if (required.includes(undefined as any)) {
    console.log(required);
    throw new Error("Host is missing required fields");
  }
  var config = ``;
  if (host.SSL && host.SSL.ForceHttps) {
    config += `server {\n`;
    config += `    listen 80;\n`;
    config += `    server_name ${host.domains[0].name};\n`;
    config += `    return 301 https://$host$request_uri;\n`;
    config += `}\n`;
  }

  config += `server {\n`;
  if (host.SSL) {
    config += `    listen 443 ssl;\n`;
    config += `    ssl_certificate ${host.SSL.fullchain()};\n`;
    config += `    ssl_certificate_key ${host.SSL.privkey()};\n`;
  } else {
    config += `    listen 80;\n`;
  }
  if (host.Php) {
    config += `    location ~ \.php$ {\n`;
    config += `        fastcgi_pass unix:${host.Php.socket};\n`;
    config += `        fastcgi_index index.php;\n`;
    config += `        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;\n`;
    config += `        include fastcgi_params;\n`;
    config += `    }\n`;
  }
  config += `    server_name ${host.domains.join(" ")};\n`;
  config += `    root ${host.root()};\n`;
  config += `    index ${host.indexes};\n`;
  config += `    access_log ${path.join(user.logs(), `${host.firstDomain().name}access.log`)};\n`;
  config += `    error_log ${path.join(user.logs(), `${host.firstDomain().name}_error.log`)};\n`;
  for (const proxy of host.ReverseProxies) {
    config += `    location ${proxy.Path} {\n`;
    config += `        proxy_pass ${proxy.Target};\n`;
    if (proxy.Timeout > 0) {
      config += `        proxy_connect_timeout ${proxy.Timeout};\n`;
      config += `        proxy_send_timeout ${proxy.Timeout};\n`;
      config += `        proxy_read_timeout ${proxy.Timeout};\n`;
    }
    config += `    }\n`;
  }
  for (const redirect of host.Redirects) {
    config += `    location ${redirect.Path} {\n`;
    config += `        return 301 ${redirect.Target};\n`;
    config += `    }\n`;
  }
  for (const error of host.ErrorCodePages) {
    config += `    error_page ${error.Code} ${error.Page};\n`;
  }
  if (host.Gzip) {
    config += `    gzip on;\n`;
    config += `    gzip_types ${host.GzipTypes};\n`;
    config += `    gzip_min_length ${host.GzipMinLength};\n`;
    config += `    gzip_comp_level ${host.GzipLevel};\n`;
  }
  config += `    client_max_body_size ${host.MaxBodySize};\n`;
  config += `}\n`;

  return config;
}
export async function ValidateConfig(host: Host, user: User): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const proc = child_process.spawn("nginx", ["-t", "-c", host.configPath()]);
    var logs = Buffer.from("");
    proc.stdout.on("data", (data) => {
      logs = Buffer.concat([logs, data]);
    });
    proc.stderr.on("data", (data) => {
      logs = Buffer.concat([logs, data]);
    });
    proc.on("close", (code) => {
      if (code != 0) {
        reject(logs.toString());
      } else {
        resolve(true);
      }
    });
  });
}
export function ReloadConfig(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const proc = child_process.spawn("sudo", ["systemctl", "reload", "nginx"]);
    var logs = Buffer.from("");
    proc.stdout.on("data", (data) => {
      logs = Buffer.concat([logs, data]);
    });
    proc.stderr.on("data", (data) => {
      logs = Buffer.concat([logs, data]);
    });
    proc.on("close", (code) => {
      if (code != 0) {
        reject(logs.toString());
      } else {
        resolve(true);
      }
    });
  });
}
