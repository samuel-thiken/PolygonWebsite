import { Databases } from "../utils/Database";
import Role from "./Role";
import bcrypt from "bcrypt";

export default class User {

  private static users: Array<User> = [];

  public static async getUserByName(username: string): Promise<User> {
    let user: User;
    if ((user = User.users.find((u) => u.username === username))) return user;
    const userData = (await Databases.polygon.query(`SELECT user_name as username, user_pass as password, user_role as role_id FROM polycp_users WHERE user_name = ?`, [username]))[0] as User;
    if (!userData) return null;
    
    user = User.from(userData);
    this.users.push(user);
    return user;
  }
  private static from(data: User): User {
    const user = new User();
    user.username = data.username;
    user.password = data.password;
    user.role_id = data.role_id;
    return user;
  }
  public static async create(username: string, password: string): Promise<void> {
    Databases.polygon.query(
      `INSERT INTO polycp_users (user_name, user_pass, user_role) VALUES
      (?, ?, ?) ON DUPLICATE KEY UPDATE user_name=user_name;`,
      [username, await bcrypt.hash(password, 10), 1]
    );
  }

  public async getRole(): Promise<Role> {
    if (this.role) return this.role;
    this.role = await Role.getRoleById(this.role_id);
    return this.role;
  }

  public username: string;
  public password: string;
  public role_id: number;
  public role: Role;

}
